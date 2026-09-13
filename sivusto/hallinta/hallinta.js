/* ==========================================================================
   BISTRO LIEKKI — sisällönhallinta
   --------------------------------------------------------------------------
   Ei kirjastoja eikä rakennusvaihetta: pelkkää selaimessa ajettavaa JS:ää,
   joka puhuu Supabasen REST- ja auth-rajapinnoille suoraan.

   Sisältö näytetään aina yhdistelmänä:
     content.js  sivuston sisäänrakennettu sisältö = lähtötilanne
     tietokanta  ravintolan omat muutokset, jotka voittavat

   Kun osio tallennetaan, koko osio kirjoitetaan tietokantaan. Edellinen
   versio jää muutoslokiin, josta sen voi palauttaa.
   ========================================================================== */
(function () {
  'use strict';

  var Y = window.LIEKKI_YHTEYS || {};
  var API = String(Y.osoite || '').replace(/\/+$/, '');
  var OLETUS = window.LIEKKI || {};

  /* Mikä sisältö kuuluu mihinkin tietokantariviin. */
  var RIVIT = {
    perustiedot: ['nimi', 'iskulause', 'perustettu', 'osoite', 'puhelin', 'puhelinHref',
                  'varausPuhelin', 'varausPuhelinHref', 'sahkoposti', 'keittioSahkoposti',
                  'linkit', 'some', 'someUpotukset', 'instagramWidget', 'instagramJulkaisut'],
    aukioloajat: ['aukioloajat', 'keittioSulkeutuuEnnen', 'lounas'],
    lounaslista: ['lounaslista'],
    menu:        ['menu'],
    ilmoitukset: ['ajankohtaista', 'aanestys', 'tyonAlla'],
    saavutukset: ['saavutukset'],
    tekstit:     ['tekstit']
  };

  /* Sivujen muokattavat tekstit. Avain vastaa HTML:n data-muokattava-arvoa. */
  var TEKSTIKENTAT = [
    { avain: 'etusivu-tervetuloa-otsikko',  nimike: 'Etusivu · otsikko',            rivit: 2 },
    { avain: 'etusivu-tervetuloa-ingressi', nimike: 'Etusivu · ingressi',           rivit: 3 },
    { avain: 'etusivu-tervetuloa-teksti',   nimike: 'Etusivu · kappale',            rivit: 3 },
    { avain: 'etusivu-alacarte-teksti',     nimike: 'Etusivu · à la carte -teksti', rivit: 3 },
    { avain: 'etusivu-some-otsikko',        nimike: 'Etusivu · some-otsikko',       rivit: 2 },
    { avain: 'etusivu-some-teksti',         nimike: 'Etusivu · some-teksti',        rivit: 3 },
    { avain: 'tarina-otsikko',              nimike: 'Tarina · otsikko',             rivit: 2 },
    { avain: 'tarina-ingressi',             nimike: 'Tarina · ingressi',            rivit: 3 },
    { avain: 'tarina-teksti',               nimike: 'Tarina · kappale',             rivit: 3 },
    { avain: 'tarina-hiillos-otsikko',      nimike: 'Tarina · hiillos-otsikko',     rivit: 2 },
    { avain: 'tarina-hiillos-teksti',       nimike: 'Tarina · hiillos-teksti',      rivit: 4 },
    { avain: 'tarina-lounas-otsikko',       nimike: 'Tarina · lounas-otsikko',      rivit: 2 },
    { avain: 'tarina-lounas-teksti',        nimike: 'Tarina · lounas-teksti',       rivit: 4 }
  ];

  var PAIVAT = ['Sunnuntai', 'Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai',
                'Perjantai', 'Lauantai'];

  /* ------------------------------------------------------------ apureita */
  var $ = function (s, r) { return (r || document).querySelector(s); };

  function kopio(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }

  function tee(tagi, luokka, teksti) {
    var e = document.createElement(tagi);
    if (luokka) e.className = luokka;
    if (teksti != null) e.textContent = teksti;
    return e;
  }

  function lisaa(vanhempi) {
    for (var i = 1; i < arguments.length; i++) {
      if (arguments[i]) vanhempi.appendChild(arguments[i]);
    }
    return vanhempi;
  }

  /* Puhelinnumerosta soittolinkki: 050 470 8530 -> +358504708530 */
  function soittomuoto(numero) {
    var n = String(numero || '').replace(/[^\d+]/g, '');
    if (!n) return '';
    if (n.charAt(0) === '+') return n;
    if (n.charAt(0) === '0') return '+358' + n.slice(1);
    return n;
  }

  /* ------------------------------------------------------------- istunto */
  var ISTUNTOAVAIN = 'liekki-hallinta-istunto';
  var istunto = { token: '', refresh: '', sposti: '' };

  function lueIstunto() {
    try {
      var j = JSON.parse(localStorage.getItem(ISTUNTOAVAIN) || 'null');
      if (j && j.token) istunto = j;
    } catch (e) { /* ei istuntoa */ }
  }
  function tallennaIstunto() {
    try { localStorage.setItem(ISTUNTOAVAIN, JSON.stringify(istunto)); } catch (e) {}
  }
  function unohdaIstunto() {
    istunto = { token: '', refresh: '', sposti: '' };
    try { localStorage.removeItem(ISTUNTOAVAIN); } catch (e) {}
  }

  function vastaus(v) {
    return v.text().then(function (t) {
      var j = null;
      try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; }
      if (!v.ok) {
        var viesti = (j && (j.virhe || j.error_description || j.msg || j.message || j.error)) ||
                     ('Palvelin vastasi ' + v.status);
        var e2 = new Error(viesti);
        e2.status = v.status;
        // Palvelin voi kertoa tarkemman syyn — se auttaa vian paikantamisessa.
        if (j && j.lisatieto) e2.lisatieto = String(j.lisatieto);
        throw e2;
      }
      return j;
    });
  }

  function uusiToken() {
    if (!istunto.refresh) return Promise.reject(new Error('Istunto on vanhentunut'));
    return fetch(API + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { apikey: Y.avain, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: istunto.refresh })
    }).then(vastaus).then(function (j) {
      istunto.token = j.access_token;
      istunto.refresh = j.refresh_token;
      tallennaIstunto();
    });
  }

  /* Kaikki tietokantakutsut kulkevat tästä: avain mukaan, token mukaan ja
     kertaalleen uusittu token, jos se oli vanhentunut. */
  function pyynto(polku, asetukset, uusittu) {
    asetukset = asetukset || {};
    var otsikot = { apikey: Y.avain, 'Content-Type': 'application/json' };
    Object.keys(asetukset.headers || {}).forEach(function (k) {
      otsikot[k] = asetukset.headers[k];
    });
    if (istunto.token) otsikot.Authorization = 'Bearer ' + istunto.token;

    return fetch(API + polku, {
      method: asetukset.method || 'GET',
      headers: otsikot,
      body: asetukset.body,
      cache: 'no-store'
    }).then(function (v) {
      if (v.status === 401 && istunto.refresh && !uusittu) {
        return uusiToken().then(function () { return pyynto(polku, asetukset, true); });
      }
      return vastaus(v);
    });
  }

  /* ----------------------------------------------------------- tilamuuttujat */
  var T = {};            // työkopio: näytettävä ja muokattava sisältö
  var ALKU = {};         // avain -> JSON ladatusta sisällöstä (muutosten vertailuun)
  var muutoksia = false;

  function kerraa(avain) {
    var ulos = {};
    RIVIT[avain].forEach(function (kentta) {
      if (T[kentta] !== undefined) ulos[kentta] = T[kentta];
    });
    return ulos;
  }

  function muuttuneet() {
    return Object.keys(RIVIT).filter(function (avain) {
      return JSON.stringify(kerraa(avain)) !== ALKU[avain];
    });
  }

  function muutos() {
    muutoksia = muuttuneet().length > 0;
    naytaTila();
  }

  function naytaTila(viesti, luokka) {
    var palkki = $('#tallennuspalkki');
    var tila = $('#tila');
    palkki.hidden = false;
    tila.className = 'tallennuspalkki__tila' + (luokka ? ' ' + luokka : '');
    if (viesti) { tila.textContent = viesti; }
    else if (muutoksia) {
      tila.textContent = 'Tallentamattomia muutoksia';
      tila.className = 'tallennuspalkki__tila on-muutoksia';
    } else {
      tila.textContent = 'Kaikki tallennettu';
    }
    $('#tallenna').disabled = !muutoksia;
    $('#peru').disabled = !muutoksia;
  }

  /* ==================================================== KENTTÄRAKENTAJAT */

  function syote(nimike, kohde, kentta, asetukset) {
    asetukset = asetukset || {};
    var lab = tee('label', 'kentta');
    if (nimike) lisaa(lab, tee('span', null, nimike));
    var i = document.createElement(asetukset.alue ? 'textarea' : 'input');
    if (!asetukset.alue) i.type = asetukset.tyyppi || 'text';
    if (asetukset.rivit) i.rows = asetukset.rivit;
    if (asetukset.vihje) i.placeholder = asetukset.vihje;
    var arvo = kohde[kentta];
    i.value = arvo == null ? '' : String(arvo);
    i.addEventListener('input', function () {
      var v = i.value;
      if (asetukset.numero) { kohde[kentta] = v === '' ? '' : (parseInt(v, 10) || 0); }
      else { kohde[kentta] = v; }
      if (asetukset.jalkeen) asetukset.jalkeen(v);
      muutos();
    });
    lisaa(lab, i);
    if (asetukset.apu) {
      var a = tee('span', 'lohko__vihje', asetukset.apu);
      a.style.display = 'block';
      a.style.marginTop = '.35rem';
      lisaa(lab, a);
    }
    return lab;
  }

  function valinta(nimike, kohde, kentta) {
    var lab = tee('label', 'kentta');
    lab.style.display = 'flex';
    lab.style.alignItems = 'center';
    lab.style.gap = '.6rem';
    lab.style.minHeight = '46px';
    var i = document.createElement('input');
    i.type = 'checkbox';
    i.checked = !!kohde[kentta];
    i.style.width = '20px';
    i.style.height = '20px';
    i.style.minHeight = '20px';
    i.style.flex = 'none';
    i.addEventListener('change', function () { kohde[kentta] = i.checked; muutos(); });
    var sp = tee('span', null, nimike);
    sp.style.margin = '0';
    return lisaa(lab, i, sp);
  }

  function lohko(otsikko, vihje) {
    var d = tee('div', 'lohko');
    if (otsikko) {
      var o = tee('div', 'lohko__otsikko');
      lisaa(o, tee('span', null, otsikko));
      if (vihje) lisaa(o, tee('span', 'lohko__vihje', vihje));
      lisaa(d, o);
    }
    return d;
  }

  /* Toistuva lista: rivit, joita voi lisätä, poistaa ja siirtää. */
  function toistuva(taulukko, piirraRivi, uusiAlkio, tyhjaTeksti, lisaaTeksti, jalkeen) {
    function ilmoita() { if (jalkeen) jalkeen(); muutos(); }
    var kehys = tee('div');
    var lista = tee('div', 'lista');
    var nappi = tee('button', 'nappi nappi--hiljainen nappi--pieni', lisaaTeksti || '+ Lisää rivi');
    nappi.type = 'button';
    nappi.style.marginTop = '.7rem';

    function piirra() {
      lista.innerHTML = '';
      if (!taulukko.length) {
        lisaa(lista, tee('div', 'lista__tyhja', tyhjaTeksti || 'Ei rivejä.'));
      }
      taulukko.forEach(function (alkio, i) {
        var rivi = tee('div', 'lista__rivi');
        lisaa(rivi, piirraRivi(alkio, i));

        var tyokalut = tee('div', 'lista__tyokalut');
        var ylos = tee('button', 'lista__nappi', '↑');
        ylos.type = 'button'; ylos.title = 'Siirrä ylös'; ylos.disabled = i === 0;
        ylos.addEventListener('click', function () {
          taulukko.splice(i - 1, 0, taulukko.splice(i, 1)[0]); piirra(); ilmoita();
        });
        var alas = tee('button', 'lista__nappi', '↓');
        alas.type = 'button'; alas.title = 'Siirrä alas'; alas.disabled = i === taulukko.length - 1;
        alas.addEventListener('click', function () {
          taulukko.splice(i + 1, 0, taulukko.splice(i, 1)[0]); piirra(); ilmoita();
        });
        var pois = tee('button', 'lista__nappi lista__nappi--poista', '✕');
        pois.type = 'button'; pois.title = 'Poista rivi';
        pois.addEventListener('click', function () {
          taulukko.splice(i, 1); piirra(); ilmoita();
        });
        lisaa(tyokalut, ylos, alas, pois);
        lisaa(rivi, tyokalut);
        lisaa(lista, rivi);
      });
    }

    nappi.addEventListener('click', function () {
      taulukko.push(uusiAlkio()); piirra(); ilmoita();
    });

    piirra();
    return lisaa(kehys, lista, nappi);
  }

  function ohjelaatikko(otsikko, kohdat) {
    var d = tee('details', 'ohje');
    var s = tee('summary', null, otsikko);
    var sisus = tee('div');
    var ul = tee('ul');
    kohdat.forEach(function (k) { lisaa(ul, tee('li', null, k)); });
    lisaa(sisus, ul);
    return lisaa(d, s, sisus);
  }

  /* ==================================================== OSIO: LOUNASLISTA */

  /* Päivän annokset esitetään tekstikenttänä, koska koko viikon lista
     vaihdetaan kerralla. Yksi rivi = yksi annos:
        Annoksen nimi | L, G | vapaa lisäteksti
     Merkinnät ja lisäteksti ovat vapaaehtoisia. */
  function annoksetTekstiksi(annokset) {
    return (annokset || []).map(function (a) {
      var osat = [a.nimi || ''];
      if (a.merkit || a.lisa) osat.push(a.merkit || '');
      if (a.lisa) osat.push(a.lisa);
      return osat.join(' | ');
    }).join('\n');
  }
  function tekstiAnnoksiksi(teksti) {
    return String(teksti || '').split('\n').map(function (rivi) {
      var osat = rivi.split('|').map(function (o) { return o.trim(); });
      if (!osat[0]) return null;
      var a = { nimi: osat[0] };
      if (osat[1]) a.merkit = osat[1];
      if (osat[2]) a.lisa = osat[2];
      return a;
    }).filter(Boolean);
  }

  /* ================================= CANVA-PDF:N TUONTI LOUNASLISTAAN */
  /* PDF luetaan selaimessa. Jos tiedostossa on oikea tekstikerros — kuten
     Canvan viennissä yleensä on — lähetämme pelkän tekstin: se on tarkka ja
     halpa. Jos teksti on litistetty kuvaksi, renderöimme ensimmäisen sivun
     kuvaksi ja lähetämme sen luettavaksi.

     Luettu lista EI mene suoraan käyttöön. Se näytetään ensin yhteenvetona,
     ja vasta erillinen painallus täyttää kentät. Mitään ei tallenneta ennen
     kuin käyttäjä painaa Tallenna. */

  var PDFJS_VER = '6.3.289';
  var pdfjsLupaus = null;

  function lataaPdfjs() {
    if (pdfjsLupaus) return pdfjsLupaus;
    pdfjsLupaus = import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VER + '/pdf.min.mjs')
      .then(function (kirjasto) {
        kirjasto.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VER + '/pdf.worker.min.mjs';
        return kirjasto;
      });
    return pdfjsLupaus;
  }

  function lueTiedosto(tiedosto) {
    return new Promise(function (onnistui, epaonnistui) {
      var lukija = new FileReader();
      lukija.onload = function () { onnistui(lukija.result); };
      lukija.onerror = function () { epaonnistui(new Error('Tiedostoa ei voitu lukea')); };
      lukija.readAsArrayBuffer(tiedosto);
    });
  }

  function kuvaksi(tiedosto) {
    return new Promise(function (onnistui, epaonnistui) {
      var lukija = new FileReader();
      lukija.onload = function () {
        var osat = String(lukija.result).split(',');
        onnistui({ kuva: osat[1], tyyppi: tiedosto.type || 'image/jpeg' });
      };
      lukija.onerror = function () { epaonnistui(new Error('Kuvaa ei voitu lukea')); };
      lukija.readAsDataURL(tiedosto);
    });
  }

  /* PDF -> { teksti } tai { kuva, tyyppi } */
  function pdfSisalto(tiedosto, kerro) {
    return lueTiedosto(tiedosto).then(function (puskuri) {
      kerro('Avataan PDF…');
      return lataaPdfjs().then(function (pdfjs) {
        return pdfjs.getDocument({ data: new Uint8Array(puskuri) }).promise;
      });
    }).then(function (pdf) {
      var sivuja = Math.min(pdf.numPages, 3);
      var tekstit = [];
      var ketju = Promise.resolve();
      for (var i = 1; i <= sivuja; i++) {
        (function (nro) {
          ketju = ketju.then(function () {
            return pdf.getPage(nro).then(function (sivu) {
              return sivu.getTextContent().then(function (sisalto) {
                // Rivitetään y-koordinaatin mukaan, jotta palstat eivät sekoitu
                var rivit = {};
                sisalto.items.forEach(function (kohde) {
                  if (!kohde.str || !kohde.str.trim()) return;
                  var y = Math.round(kohde.transform[5]);
                  var x = Math.round(kohde.transform[4]);
                  (rivit[y] = rivit[y] || []).push({ x: x, t: kohde.str });
                });
                var jarjestys = Object.keys(rivit).map(Number).sort(function (a, b) { return b - a; });
                jarjestys.forEach(function (y) {
                  rivit[y].sort(function (a, b) { return a.x - b.x; });
                  tekstit.push(rivit[y].map(function (o) { return o.t; }).join(' ').trim());
                });
              });
            });
          });
        })(i);
      }
      return ketju.then(function () {
        var teksti = tekstit.join('\n').trim();
        if (teksti.length > 120) return { teksti: teksti };
        // Ei tekstikerrosta: renderöidään ensimmäinen sivu kuvaksi
        kerro('PDF:ssä ei ole tekstiä — luetaan se kuvana…');
        return pdf.getPage(1).then(function (sivu) {
          var perus = sivu.getViewport({ scale: 1 });
          var skaala = Math.min(2.2, 1600 / perus.width);
          var nakyma = sivu.getViewport({ scale: skaala });
          var kangas = document.createElement('canvas');
          kangas.width = Math.round(nakyma.width);
          kangas.height = Math.round(nakyma.height);
          return sivu.render({ canvasContext: kangas.getContext('2d'), viewport: nakyma })
            .promise.then(function () {
              return { kuva: kangas.toDataURL('image/jpeg', 0.85).split(',')[1],
                       tyyppi: 'image/jpeg' };
            });
        });
      });
    });
  }

  function tuontilaatikko(L) {
    var lb = lohko('Tuo Canva-PDF', 'Lista luetaan tiedostosta kenttiin');
    var viesti = tee('p', 'viesti');
    viesti.hidden = true;
    var yhteenveto = tee('div');
    yhteenveto.hidden = true;

    var selite = tee('p', 'lohko__vihje',
      'Vie lista Canvasta PDF-muodossa ja valitse tiedosto tästä. ' +
      'Kelpaa myös PNG- tai JPG-kuva. Luettu lista näytetään ensin tarkistettavaksi — ' +
      'mitään ei tallenneta ennen kuin painat Tallenna.');
    selite.style.margin = '0 0 1rem';
    lisaa(lb, selite, viesti, yhteenveto);

    var valitsin = document.createElement('input');
    valitsin.type = 'file';
    valitsin.accept = '.pdf,application/pdf,image/png,image/jpeg';
    valitsin.style.display = 'none';

    var nappi = tee('button', 'nappi nappi--hiljainen', 'Valitse tiedosto');
    nappi.type = 'button';
    nappi.addEventListener('click', function () { valitsin.click(); });

    function kerro(teksti, luokka) {
      viesti.hidden = false;
      viesti.className = 'viesti' + (luokka ? ' viesti--' + luokka : '');
      viesti.textContent = teksti;
    }

    valitsin.addEventListener('change', function () {
      var tiedosto = valitsin.files && valitsin.files[0];
      if (!tiedosto) return;
      yhteenveto.hidden = true;
      yhteenveto.innerHTML = '';
      nappi.disabled = true;
      kerro('Luetaan tiedostoa…');

      var sisalto = /pdf/i.test(tiedosto.type) || /\.pdf$/i.test(tiedosto.name)
        ? pdfSisalto(tiedosto, kerro)
        : kuvaksi(tiedosto);

      sisalto.then(function (runko) {
        kerro('Tulkitaan listaa…');
        return pyynto('/functions/v1/lue-lounaslista', {
          method: 'POST', body: JSON.stringify(runko)
        });
      }).then(function (tulos) {
        naytaTuonti(L, tulos, yhteenveto, kerro);
      }).catch(function (e) {
        kerro('Lukeminen ei onnistunut: ' + e.message +
              (e.lisatieto ? '  (' + e.lisatieto + ')' : ''), 'virhe');
      }).then(function () {
        nappi.disabled = false;
        valitsin.value = '';
      });
    });

    /* Pikatesti: kertoo onko tekoälyavain paikallaan ilman, että tarvitsee
       etsiä PDF:ää kokeilua varten. */
    var testi = tee('button', 'nappi nappi--hiljainen nappi--pieni', 'Testaa yhteys');
    testi.type = 'button';
    testi.style.marginLeft = '.5rem';
    testi.addEventListener('click', function () {
      testi.disabled = true;
      kerro('Testataan…');
      pyynto('/functions/v1/lue-lounaslista', {
        method: 'POST', body: JSON.stringify({ testi: true })
      }).then(function (v) {
        kerro('Yhteys kunnossa. Käytössä oleva malli: ' + (v && v.malli || 'tuntematon') +
              '. Voit tuoda Canva-listan.', 'onnistui');
      }).catch(function (e) {
        kerro('Yhteys ei toimi: ' + e.message, 'virhe');
      }).then(function () { testi.disabled = false; });
    });

    var napit = tee('div');
    lisaa(napit, nappi, testi, valitsin);
    lisaa(lb, napit);
    return lb;
  }

  function naytaTuonti(L, tulos, kehys, kerro) {
    var paivat = (tulos && tulos.paivat || []).filter(function (p) {
      return p && p.paiva >= 1 && p.paiva <= 5 && (p.annokset || []).length;
    });
    if (!paivat.length) {
      kerro('Tiedostosta ei löytynyt päiväkohtaisia annoksia. ' +
            'Tarkista että kyseessä on viikon lounaslista, tai kirjoita lista käsin.', 'virhe');
      return;
    }

    var annoksia = 0;
    paivat.forEach(function (p) { annoksia += p.annokset.length; });
    kerro('Luettu: ' + paivat.length + ' päivää, ' + annoksia + ' annosta. ' +
          'Tarkista alta ja täytä kentät.', 'onnistui');

    kehys.hidden = false;
    kehys.innerHTML = '';

    var lista = tee('div', 'lista');
    paivat.forEach(function (p) {
      var rivi = tee('div', 'lista__rivi lista__rivi--tiivis');
      lisaa(rivi, tee('div', 'lohko__otsikko', PAIVAT[p.paiva] + (p.pvm ? ' · ' + p.pvm : '')));
      var ul = tee('div');
      ul.style.fontSize = '13px';
      ul.style.color = 'var(--bone-3)';
      p.annokset.forEach(function (a) {
        var t = a.nimi + (a.merkit ? '  ' + a.merkit : '') + (a.lisa ? '  (' + a.lisa + ')' : '');
        lisaa(ul, tee('div', null, t));
      });
      lisaa(rivi, ul);
      lisaa(lista, rivi);
    });
    lisaa(kehys, lista);

    var epavarmat = (tulos.epavarmat || []).filter(Boolean);
    if (epavarmat.length) {
      var varoitus = tee('div', 'viesti viesti--virhe');
      varoitus.style.marginTop = '1rem';
      lisaa(varoitus, tee('strong', null, 'Tarkista nämä kohdat erikseen:'));
      var ul2 = tee('ul');
      ul2.style.margin = '.4rem 0 0';
      ul2.style.paddingLeft = '1.2rem';
      epavarmat.forEach(function (e) { lisaa(ul2, tee('li', null, String(e))); });
      lisaa(varoitus, ul2);
      lisaa(kehys, varoitus);
    }

    var muistutus = tee('p', 'lohko__vihje',
      'Ruokavaliomerkinnät (L, VL, G, M, V) kannattaa aina tarkistaa alkuperäisestä ' +
      'listasta. Puuttuva merkintä on turvallisempi kuin väärä.');
    muistutus.style.margin = '1rem 0';
    lisaa(kehys, muistutus);

    var tayta = tee('button', 'nappi', 'Täytä kentät tällä listalla');
    tayta.type = 'button';
    tayta.addEventListener('click', function () {
      if (!window.confirm('Korvataanko nykyiset päiväkohtaiset annokset luetulla listalla?')) return;
      if (tulos.viikko) L.viikko = String(tulos.viikko);
      if (tulos.ajalla) L.ajalla = String(tulos.ajalla);
      L.paivat.forEach(function (p) {
        var luettu = null;
        paivat.forEach(function (x) { if (x.paiva === p.paiva) luettu = x; });
        if (!luettu) return;
        if (luettu.pvm) p.pvm = String(luettu.pvm);
        p.annokset = luettu.annokset.map(function (a) {
          var uusi = { nimi: String(a.nimi || '').trim() };
          if (a.merkit) uusi.merkit = String(a.merkit).trim();
          if (a.lisa) uusi.lisa = String(a.lisa).trim();
          return uusi;
        }).filter(function (a) { return a.nimi; });
      });
      muutos();
      piirraPaneelit();
      naytaTila('Lista tuotu — tarkista kentät ja paina Tallenna', 'on-muutoksia');
    });
    lisaa(kehys, tayta);
  }

  function paneeliLounas() {
    var k = tee('div');
    var L = T.lounaslista;

    lisaa(k, ohjelaatikko('Näin päivität viikon lounaslistan', [
      'Nopein tapa: tuo Canvasta viety PDF alla olevasta laatikosta. Lista luetaan tiedostosta kenttiin, ja tarkistat sen ennen tallennusta.',
      'Voit myös kirjoittaa listan käsin: jokaisen päivän annokset omalle riville, yksi rivi = yksi annos.',
      'Merkinnät kirjoitetaan pystyviivan jälkeen, esimerkiksi: Kermaperunat | L, G',
      'Jos annoksella on vielä lisäselite, se tulee toisen pystyviivan jälkeen: Päivän smash-burgerit |  | Pyydettäessä L, G, kasvis tai vege',
      'Tyhjäksi jätetty päivä katoaa sivulta kokonaan.',
      'Muista painaa Tallenna sivun alalaidasta.'
    ]));

    lisaa(k, tuontilaatikko(L));

    var perus = lohko('Viikko');
    var r1 = tee('div', 'rivi rivi--2');
    lisaa(r1, syote('Viikon numero', L, 'viikko', { vihje: '37' }),
              syote('Päivämäärät', L, 'ajalla', { vihje: '7.9.–11.9.' }));
    lisaa(perus, r1,
      syote('Merkintöjen selitykset', L, 'merkkiselite',
            { apu: 'Näkyy listan alalaidassa.' }),
      syote('Huomautus', L, 'huomio', { vihje: 'Pidätämme oikeuden kaikkiin muutoksiin.' }));
    lisaa(k, perus);

    // Päivät
    L.paivat.forEach(function (paiva) {
      var nro = paiva.paiva;
      var lb = lohko(PAIVAT[nro], (paiva.annokset || []).length + ' annosta');
      lisaa(lb, syote('Päivämäärä', paiva, 'pvm', { vihje: '7.9.' }));

      var alue = document.createElement('textarea');
      alue.rows = 12;
      alue.value = annoksetTekstiksi(paiva.annokset);
      alue.placeholder = 'Pariloitua kanaa yrttikastikkeessa | L, G';
      alue.addEventListener('input', function () {
        paiva.annokset = tekstiAnnoksiksi(alue.value);
        var o = lb.querySelector('.lohko__vihje');
        if (o) o.textContent = paiva.annokset.length + ' annosta';
        muutos();
      });
      var lab = tee('label', 'kentta');
      lisaa(lab, tee('span', null, 'Annokset, yksi riviä kohden'), alue);
      lisaa(lb, lab);
      lisaa(k, lb);
    });

    // Hinnat
    var hl = lohko('Hinnat');
    lisaa(hl, toistuva(L.hinnat, function (h) {
      var r = tee('div', 'rivi rivi--2');
      return lisaa(r, syote('Nimike', h, 'nimi', { vihje: 'Lounasbuffet' }),
                      syote('Hinta', h, 'hinta', { vihje: '16,00 €' }));
    }, function () { return { nimi: '', hinta: '' }; }, 'Ei hintoja.', '+ Lisää hinta'));
    lisaa(k, hl);

    // Mitä lounaaseen sisältyy
    var sl = lohko('Lounaaseen sisältyy', 'Näkyy listan yläpuolella.');
    var sisaltyyOliot = L.sisaltyy.map(function (s) { return { teksti: s }; });
    function paivitaSisaltyy() {
      L.sisaltyy = sisaltyyOliot.map(function (x) { return x.teksti; })
                                .filter(function (x) { return x && x.trim(); });
    }
    lisaa(sl, toistuva(sisaltyyOliot, function (s) {
      return syote('', s, 'teksti', { vihje: 'Runsas salaattipöytä', jalkeen: paivitaSisaltyy });
    }, function () { return { teksti: '' }; },
       'Ei rivejä.', '+ Lisää rivi', paivitaSisaltyy));
    lisaa(k, sl);

    return k;
  }

  /* ======================================================= OSIO: RUOKALISTA */

  function paneeliMenu() {
    var k = tee('div');
    var M = T.menu;

    lisaa(k, ohjelaatikko('Näin muokkaat ruokalistaa', [
      'Avaa ryhmä otsikosta, niin sen annokset tulevat näkyviin.',
      'Hinnan voi kirjoittaa vapaasti, esimerkiksi 21,50 € tai 27,00 € / 38,00 €.',
      'Merkinnät erotellaan pilkulla: L, G',
      'Tyhjäksi jätetty annoksen nimi poistaa rivin tallennuksessa.',
      'Uuden ryhmän saa listan alalaidasta. Ryhmän nimi on sen otsikko sivulla.'
    ]));

    var yleiset = lohko('Yleiset');
    lisaa(yleiset, syote('Merkintöjen selitykset', M, 'merkkiselite'));
    lisaa(k, yleiset);

    M.osiot.forEach(function (osio) {
      var ob = lohko(osio.nimi || 'Osio', (osio.annokset || []).length + ' annosta');
      lisaa(ob, syote('Osion kuvaus', osio, 'kuvaus', { alue: true, rivit: 2 }));

      // Huomautukset osion lopussa
      var huomiot = osio.huomiot.map(function (h) { return { teksti: h }; });
      function paivitaHuomiot() { osio.huomiot = huomiot.map(function (h) { return h.teksti; }); }
      var hkehys = tee('div');
      hkehys.style.marginBottom = '1.2rem';
      lisaa(hkehys, tee('span', 'lohko__vihje', 'Huomautukset osion lopussa'));
      lisaa(hkehys, toistuva(huomiot, function (h) {
        return syote('', h, 'teksti', { alue: true, rivit: 2, jalkeen: paivitaHuomiot });
      }, function () { return { teksti: '' }; },
         'Ei huomautuksia.', '+ Lisää huomautus', paivitaHuomiot));
      lisaa(ob, hkehys);

      // Annokset ryhmiteltynä
      var ryhmat = ryhmita(osio.annokset);

      ryhmat.forEach(function (ryhma) {
        var d = tee('details', 'ohje');
        d.style.marginBottom = '.7rem';
        var s = tee('summary', null, (ryhma.nimi || 'Nimetön ryhmä') + ' · ' + ryhma.rivit.length + ' annosta');
        var sisus = tee('div');
        lisaa(d, s, sisus);

        var avattu = false;
        d.addEventListener('toggle', function () {
          if (!d.open || avattu) return;
          avattu = true;
          var r = tee('div', 'rivi rivi--2');
          lisaa(r,
            syote('Ryhmän otsikko', ryhma, 'nimi', {
              jalkeen: function () {
                ryhma.rivit.forEach(function (x) { x.ryhma = ryhma.nimi; });
                s.textContent = (ryhma.nimi || 'Nimetön ryhmä') + ' · ' + ryhma.rivit.length + ' annosta';
              }
            }),
            syote('Lisäteksti otsikon perässä', ryhma, 'lisa', {
              vihje: 'Extra smash-pihvi 5 €',
              jalkeen: function () {
                ryhma.rivit.forEach(function (x, i) {
                  if (i === 0 && ryhma.lisa) x.ryhmaLisa = ryhma.lisa; else delete x.ryhmaLisa;
                });
              }
            }));
          lisaa(sisus, r);

          lisaa(sisus, toistuva(ryhma.rivit, function (rivi) {
            var kehys = tee('div');
            var yla = tee('div', 'rivi rivi--2');
            lisaa(yla, syote('Annos', rivi, 'nimi'), syote('Hinta', rivi, 'hinta', { vihje: '14,50 €' }));
            var ala = tee('div', 'rivi rivi--2');
            lisaa(ala, syote('Merkinnät', rivi, 'merkit', { vihje: 'L, G' }),
                       syote('Yliviivattu vanha hinta', rivi, 'hintalisa', { vihje: 'jätä tyhjäksi' }));
            lisaa(kehys, yla, ala, syote('Kuvaus', rivi, 'kuvaus', { alue: true, rivit: 2 }));
            return kehys;
          }, function () {
            return { ryhma: ryhma.nimi, nimi: '', merkit: '', hinta: '', kuvaus: '' };
          }, 'Ei annoksia tässä ryhmässä.', '+ Lisää annos'));

          sisus.addEventListener('click', function () {
            setTimeout(function () {
              ryhma.rivit.forEach(function (x) { x.ryhma = ryhma.nimi; });
              osio.annokset = pura(ryhmat);
              s.textContent = (ryhma.nimi || 'Nimetön ryhmä') + ' · ' + ryhma.rivit.length + ' annosta';
              var vihje = ob.querySelector('.lohko__vihje');
              if (vihje) vihje.textContent = osio.annokset.length + ' annosta';
              muutos();
            }, 0);
          });
          sisus.addEventListener('input', function () {
            setTimeout(function () { osio.annokset = pura(ryhmat); muutos(); }, 0);
          });
        });

        lisaa(ob, d);
      });

      var lisaaRyhma = tee('button', 'nappi nappi--hiljainen nappi--pieni', '+ Lisää ryhmä');
      lisaaRyhma.type = 'button';
      lisaaRyhma.addEventListener('click', function () {
        osio.annokset.push({ ryhma: 'Uusi ryhmä', nimi: '', merkit: '', hinta: '', kuvaus: '' });
        piirraPaneelit();
        muutos();
      });
      lisaa(ob, lisaaRyhma);
      lisaa(k, ob);
    });

    return k;
  }

  /* Peräkkäiset saman ryhmänimen rivit muodostavat ryhmän — sama sääntö
     kuin sivuston puolella. */
  function ryhmita(annokset) {
    var ulos = [];
    var nyt = null;
    annokset.forEach(function (a) {
      if (!nyt || nyt.nimi !== (a.ryhma || '')) {
        nyt = { nimi: a.ryhma || '', lisa: a.ryhmaLisa || '', rivit: [] };
        ulos.push(nyt);
      }
      if (a.ryhmaLisa && !nyt.lisa) nyt.lisa = a.ryhmaLisa;
      nyt.rivit.push(a);
    });
    return ulos;
  }
  function pura(ryhmat) {
    var ulos = [];
    ryhmat.forEach(function (r) {
      r.rivit.forEach(function (x, i) {
        x.ryhma = r.nimi;
        if (i === 0 && r.lisa) x.ryhmaLisa = r.lisa; else delete x.ryhmaLisa;
        ulos.push(x);
      });
    });
    return ulos;
  }

  /* ============================================ OSIO: AUKIOLO JA ILMOITUKSET */

  function paneeliAukiolo() {
    var k = tee('div');
    lisaa(k, ohjelaatikko('Näin muokkaat aukioloja ja ilmoituksia', [
      'Suljettu-ruutu piilottaa päivän kellonajat ja merkitsee päivän suljetuksi.',
      'Ajankohtainen ilmoitus katoaa sivulta automaattisesti päättymispäivän jälkeen.',
      'Päivämäärät kirjoitetaan muodossa 2026-12-24.',
      'Äänestyslaatikon ja työn alla -ilmoituksen saa pois näkyvistä poistamalla ruudun valinnan.'
    ]));

    // Aukioloajat
    var ab = lohko('Aukioloajat');
    [1, 2, 3, 4, 5, 6, 0].forEach(function (nro) {
      var p = null;
      T.aukioloajat.forEach(function (x) { if (x.paiva === nro) p = x; });
      if (!p) return;

      var rivi = tee('div', 'lista__rivi lista__rivi--tiivis');
      var r = tee('div', 'rivi rivi--3');
      var nimiLab = tee('label', 'kentta');
      lisaa(nimiLab, tee('span', null, 'Päivä'));
      var nimiI = document.createElement('input');
      nimiI.type = 'text'; nimiI.value = PAIVAT[nro]; nimiI.disabled = true;
      nimiI.style.opacity = '.6';
      lisaa(nimiLab, nimiI);

      var suljettu = !p.auki;
      var aukiLab = syote('Avataan', p, 'auki', { tyyppi: 'time' });
      var kiinniLab = syote('Suljetaan', p, 'kiinni', { tyyppi: 'time' });
      lisaa(r, nimiLab, aukiLab, kiinniLab);

      var sulje = tee('label', 'kentta');
      sulje.style.display = 'flex';
      sulje.style.alignItems = 'center';
      sulje.style.gap = '.6rem';
      sulje.style.minHeight = '46px';
      var ruutu = document.createElement('input');
      ruutu.type = 'checkbox';
      ruutu.checked = suljettu;
      ruutu.style.width = '20px'; ruutu.style.height = '20px';
      ruutu.style.minHeight = '20px'; ruutu.style.flex = 'none';
      function paivitaTila() {
        var kiinniNyt = ruutu.checked;
        aukiLab.querySelector('input').disabled = kiinniNyt;
        kiinniLab.querySelector('input').disabled = kiinniNyt;
        aukiLab.style.opacity = kiinniNyt ? '.4' : '1';
        kiinniLab.style.opacity = kiinniNyt ? '.4' : '1';
      }
      ruutu.addEventListener('change', function () {
        if (ruutu.checked) { p.auki = null; p.kiinni = null; }
        else {
          if (!p.auki) p.auki = '10:30';
          if (!p.kiinni) p.kiinni = '22:00';
          aukiLab.querySelector('input').value = p.auki;
          kiinniLab.querySelector('input').value = p.kiinni;
        }
        paivitaTila();
        muutos();
      });
      var st = tee('span', null, 'Suljettu');
      st.style.margin = '0';
      lisaa(sulje, ruutu, st);
      paivitaTila();

      lisaa(rivi, r, sulje);
      lisaa(ab, rivi);
    });
    lisaa(ab, syote('Keittiö sulkeutuu näin monta minuuttia ennen sulkemista',
                    T, 'keittioSulkeutuuEnnen', { numero: true, vihje: '45' }));
    lisaa(k, ab);

    // Lounasaika
    var lb = lohko('Lounasaika');
    var lr = tee('div', 'rivi rivi--2');
    lisaa(lr, syote('Lounas alkaa', T.lounas, 'auki', { tyyppi: 'time' }),
              syote('Lounas päättyy', T.lounas, 'kiinni', { tyyppi: 'time' }));
    var lr2 = tee('div', 'rivi rivi--2');
    lisaa(lr2, syote('Lounaan hinta', T.lounas, 'hinta', { vihje: '16,00 €' }),
               syote('Hinnan lisätieto', T.lounas, 'hintaLisatieto'));
    lisaa(lb, lr, lr2, syote('Päivät tekstinä', T.lounas, 'paivatTeksti', { vihje: 'Arkisin ma–pe' }));
    lisaa(k, lb);

    // Ajankohtaista
    var jb = lohko('Ajankohtaiset ilmoitukset', 'Poikkeusaukiolot, juhlapyhät, tapahtumat');
    lisaa(jb, toistuva(T.ajankohtaista, function (i) {
      var kehys = tee('div');
      lisaa(kehys, syote('Otsikko', i, 'otsikko', { vihje: 'Poikkeava aukiolo' }));
      lisaa(kehys, syote('Teksti', i, 'teksti', { alue: true, rivit: 2 }));
      var r = tee('div', 'rivi rivi--2');
      lisaa(r, syote('Alkaa', i, 'alkaa', { vihje: '2026-12-24' }),
               syote('Päättyy', i, 'paattyy', { vihje: '2026-12-26' }));
      lisaa(kehys, r, valinta('Korosta ilmoitus', i, 'korosta'));
      return kehys;
    }, function () { return { otsikko: '', teksti: '', alkaa: '', paattyy: '', korosta: false }; },
       'Ei ajankohtaisia ilmoituksia.', '+ Lisää ilmoitus'));
    lisaa(k, jb);

    // Äänestyslaatikko
    var eb = lohko('Äänestyslaatikko', 'Näkyy sivuston alalaidassa tai oikeassa ylänurkassa');
    lisaa(eb, valinta('Näytetään sivustolla', T.aanestys, 'naytetaan'));
    var er = tee('div', 'rivi rivi--2');
    lisaa(er, syote('Yläotsikko', T.aanestys, 'ylatunnus', { vihje: 'Edenred' }),
              syote('Painikkeen teksti', T.aanestys, 'painike', { vihje: 'Äänestä meitä' }));
    lisaa(eb, syote('Otsikko', T.aanestys, 'otsikko'), er,
              syote('Teksti', T.aanestys, 'teksti', { alue: true, rivit: 2 }),
              syote('Linkki', T.aanestys, 'linkki', { tyyppi: 'url' }));
    lisaa(k, eb);

    // Työn alla
    var tb = lohko('Työn alla -ilmoitus');
    lisaa(tb, valinta('Näytetään sivustolla', T.tyonAlla, 'naytetaan'),
              syote('Teksti', T.tyonAlla, 'teksti', { alue: true, rivit: 3 }));
    lisaa(k, tb);

    return k;
  }

  /* ================================================ OSIO: TIEDOT JA TEKSTIT */

  function paneeliTiedot() {
    var k = tee('div');
    lisaa(k, ohjelaatikko('Näin muokkaat tietoja ja tekstejä', [
      'Puhelinnumeron soittolinkki muodostuu itsestään — kirjoita numero vain kerran.',
      'Tyhjäksi jätetty some-osoite piilottaa kyseisen kanavan sivustolta.',
      'Tekstikentän tyhjentäminen palauttaa sivuston alkuperäisen tekstin.',
      'Rivinvaihto tekstikentässä tarkoittaa rivinvaihtoa myös sivulla.'
    ]));

    var pb = lohko('Perustiedot');
    lisaa(pb, syote('Ravintolan nimi', T, 'nimi'),
              syote('Iskulause', T, 'iskulause'));
    var or = tee('div', 'rivi rivi--3');
    lisaa(or, syote('Katuosoite', T.osoite, 'katu'),
              syote('Postinumero', T.osoite, 'postinumero'),
              syote('Kaupunki', T.osoite, 'kaupunki'));
    lisaa(pb, or);
    lisaa(k, pb);

    var yb = lohko('Yhteystiedot');
    lisaa(yb, syote('Puhelin', T, 'puhelin', {
      apu: 'Soittolinkki muodostuu automaattisesti.',
      jalkeen: function (v) { T.puhelinHref = soittomuoto(v); }
    }));
    lisaa(yb, syote('Varausnumero', T, 'varausPuhelin', {
      apu: 'Voi olla sama kuin yllä.',
      jalkeen: function (v) { T.varausPuhelinHref = soittomuoto(v); }
    }));
    var sr = tee('div', 'rivi rivi--2');
    lisaa(sr, syote('Sähköposti', T, 'sahkoposti', { tyyppi: 'email' }),
              syote('Keittiön sähköposti', T, 'keittioSahkoposti', { tyyppi: 'email' }));
    lisaa(yb, sr);
    lisaa(k, yb);

    var lb = lohko('Linkit');
    lisaa(lb,
      syote('Pöytävaraus', T.linkit, 'varaus', { tyyppi: 'url' }),
      syote('Lahjakortti', T.linkit, 'lahjakortti', { tyyppi: 'url' }),
      syote('Reittiohjeet', T.linkit, 'reittiohjeet', { tyyppi: 'url' }),
      syote('Kartta', T.linkit, 'kartta', { tyyppi: 'url' }));
    lisaa(k, lb);

    var sb = lohko('Sosiaalinen media', 'Tyhjä osoite piilottaa kanavan');
    lisaa(sb,
      syote('Facebook', T.some, 'facebook', { tyyppi: 'url' }),
      syote('Instagram', T.some, 'instagram', { tyyppi: 'url' }),
      syote('TikTok', T.some, 'tiktok', { tyyppi: 'url' }),
      syote('Snapchat', T.some, 'snapchat', { tyyppi: 'url' }),
      syote('YouTube', T.some, 'youtube', { tyyppi: 'url' }));

    var ig = { teksti: (T.instagramJulkaisut || []).join('\n') };
    lisaa(sb, syote('Instagram-julkaisut etusivulla', ig, 'teksti', {
      alue: true, rivit: 5,
      vihje: 'https://www.instagram.com/reel/XXXXXXXXX/',
      apu: 'Yksi julkaisun osoite riviä kohden. Tyhjänä kortissa näkyvät talon omat kuvat.',
      jalkeen: function (v) {
        T.instagramJulkaisut = String(v).split('\n').map(function (x) { return x.trim(); })
                                        .filter(Boolean);
      }
    }));
    lisaa(k, sb);

    var ab = lohko('Saavutukset', 'Uusin vuosi ensin');
    lisaa(ab, toistuva(T.saavutukset, function (v) {
      var kehys = tee('div');
      lisaa(kehys, syote('Vuosi', v, 'vuosi', { vihje: '2026' }));
      var t = { teksti: (v.tunnustukset || []).join('\n') };
      lisaa(kehys, syote('Tunnustukset', t, 'teksti', {
        alue: true, rivit: 3,
        vihje: 'Suomen paras burger -kisassa sijalla 19',
        apu: 'Yksi tunnustus riviä kohden.',
        jalkeen: function (x) {
          v.tunnustukset = String(x).split('\n').map(function (y) { return y.trim(); })
                                    .filter(Boolean);
        }
      }));
      return kehys;
    }, function () { return { vuosi: '', tunnustukset: [] }; },
       'Ei saavutuksia.', '+ Lisää vuosi'));
    lisaa(k, ab);

    var tb = lohko('Sivujen tekstit', 'Tyhjä kenttä = sivuston alkuperäinen teksti');
    TEKSTIKENTAT.forEach(function (kentta) {
      lisaa(tb, syote(kentta.nimike, T.tekstit, kentta.avain, {
        alue: true, rivit: kentta.rivit, vihje: 'Alkuperäinen teksti käytössä'
      }));
    });
    lisaa(k, tb);

    return k;
  }

  /* ================================================= OSIO: TILI JA VERSIOT */

  function paneeliTili() {
    var k = tee('div');

    var vb = lohko('Vaihda salasana');
    var uusi = { a: '', b: '' };
    var viesti = tee('p', 'viesti');
    viesti.hidden = true;
    lisaa(vb, viesti,
      syote('Uusi salasana', uusi, 'a', { tyyppi: 'password' }),
      syote('Uusi salasana uudelleen', uusi, 'b', { tyyppi: 'password' }));
    var vn = tee('button', 'nappi', 'Vaihda salasana');
    vn.type = 'button';
    vn.addEventListener('click', function () {
      viesti.hidden = false;
      if (uusi.a.length < 10) {
        viesti.className = 'viesti viesti--virhe';
        viesti.textContent = 'Salasanassa on oltava vähintään 10 merkkiä.';
        return;
      }
      if (uusi.a !== uusi.b) {
        viesti.className = 'viesti viesti--virhe';
        viesti.textContent = 'Salasanat eivät täsmää.';
        return;
      }
      vn.disabled = true;
      pyynto('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ password: uusi.a }) })
        .then(function () {
          viesti.className = 'viesti viesti--onnistui';
          viesti.textContent = 'Salasana vaihdettu.';
        })
        .catch(function (e) {
          viesti.className = 'viesti viesti--virhe';
          viesti.textContent = 'Salasanan vaihto ei onnistunut: ' + e.message;
        })
        .then(function () { vn.disabled = false; });
    });
    lisaa(vb, vn);
    lisaa(k, vb);

    var hb = lohko('Palauta edellinen versio',
                   'Viimeisimmät tallennukset osioittain');
    var lista = tee('div', 'lista');
    lisaa(hb, lista);
    var hn = tee('button', 'nappi nappi--hiljainen nappi--pieni', 'Hae muutoshistoria');
    hn.type = 'button';
    hn.addEventListener('click', function () {
      hn.disabled = true;
      lista.innerHTML = '';
      pyynto('/rest/v1/muutosloki?select=id,avain,data,paivitetty&order=paivitetty.desc&limit=25')
        .then(function (rivit) {
          if (!rivit || !rivit.length) {
            lisaa(lista, tee('div', 'lista__tyhja', 'Ei aiempia versioita.'));
            return;
          }
          rivit.forEach(function (r) {
            var rivi = tee('div', 'lista__rivi lista__rivi--tiivis');
            var teksti = tee('div');
            lisaa(teksti, tee('div', null, OSIONIMET[r.avain] || r.avain));
            var aika = tee('div', 'lohko__vihje', uusiAika(r.paivitetty));
            aika.style.letterSpacing = '0';
            aika.style.textTransform = 'none';
            lisaa(teksti, aika);
            var nappi = tee('button', 'nappi nappi--hiljainen nappi--pieni', 'Palauta tämä');
            nappi.type = 'button';
            nappi.addEventListener('click', function () {
              if (!window.confirm('Palautetaanko osion "' + (OSIONIMET[r.avain] || r.avain) +
                                  '" versio ' + uusiAika(r.paivitetty) + '?')) return;
              nappi.disabled = true;
              tallennaOsio(r.avain, r.data)
                .then(function () { location.reload(); })
                .catch(function (e) {
                  nappi.disabled = false;
                  window.alert('Palautus ei onnistunut: ' + e.message);
                });
            });
            var yla = tee('div', 'rivi rivi--kapea-loppu');
            lisaa(yla, teksti, nappi);
            lisaa(rivi, yla);
            lisaa(lista, rivi);
          });
        })
        .catch(function (e) {
          lisaa(lista, tee('div', 'lista__tyhja', 'Historian haku ei onnistunut: ' + e.message));
        })
        .then(function () { hn.disabled = false; });
    });
    lisaa(hb, hn);
    lisaa(k, hb);

    return k;
  }

  function uusiAika(iso) {
    try {
      var d = new Date(iso);
      return d.toLocaleDateString('fi-FI') + ' klo ' +
             d.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return iso; }
  }

  /* ======================================================== VÄLILEHDET */

  var OSIONIMET = {
    perustiedot: 'Tiedot ja tekstit',
    aukioloajat: 'Aukiolo ja ilmoitukset',
    lounaslista: 'Lounaslista',
    menu: 'Ruokalista',
    ilmoitukset: 'Aukiolo ja ilmoitukset',
    saavutukset: 'Tiedot ja tekstit',
    tekstit: 'Tiedot ja tekstit'
  };

  var PANEELIT = [
    { avain: 'lounas',  nimi: 'Lounaslista',   otsikko: 'Viikon lounaslista',
      ohje: 'Tämä lista näkyy Lounas-sivulla ja etusivulla. Kuluva päivä nousee automaattisesti ensimmäiseksi.',
      rakenna: paneeliLounas },
    { avain: 'menu',    nimi: 'Ruokalista',    otsikko: 'Ruokalista',
      ohje: 'À la carte, brunssi ja juomat. Muutokset näkyvät Menu-sivulla.',
      rakenna: paneeliMenu },
    { avain: 'aukiolo', nimi: 'Aukiolo ja ilmoitukset', otsikko: 'Aukioloajat ja ilmoitukset',
      ohje: 'Aukioloajat näkyvät joka sivulla. Ilmoitukset nousevat esiin etusivulla ja tilapalkissa.',
      rakenna: paneeliAukiolo },
    { avain: 'tiedot',  nimi: 'Tiedot ja tekstit', otsikko: 'Tiedot ja tekstit',
      ohje: 'Yhteystiedot, linkit, some-osoitteet, saavutukset ja sivujen tekstit.',
      rakenna: paneeliTiedot },
    { avain: 'tili',    nimi: 'Tili',          otsikko: 'Tili ja versiot',
      ohje: 'Salasanan vaihto ja aiempien versioiden palautus.',
      rakenna: paneeliTili }
  ];

  var valittu = 'lounas';

  function piirraValilehdet() {
    var n = $('#valilehdet');
    n.innerHTML = '';
    PANEELIT.forEach(function (p) {
      var b = tee('button', 'valilehti', p.nimi);
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', p.avain === valittu ? 'true' : 'false');
      b.addEventListener('click', function () {
        valittu = p.avain;
        piirraValilehdet();
        piirraPaneelit();
      });
      lisaa(n, b);
    });
  }

  function piirraPaneelit() {
    var s = $('#sisus');
    s.innerHTML = '';
    var p = null;
    PANEELIT.forEach(function (x) { if (x.avain === valittu) p = x; });
    if (!p) return;
    lisaa(s, tee('h1', 'paneeli__otsikko', p.otsikko));
    lisaa(s, tee('p', 'paneeli__ohje', p.ohje));
    lisaa(s, p.rakenna());
    window.scrollTo(0, 0);
  }

  /* ======================================================= LATAUS JA TALLENNUS */

  /* Täydennetään puuttuvat rakenteet heti latauksessa — ei vasta silloin kun
     välilehti avataan. Muuten pelkkä välilehden avaaminen näyttäisi
     tallentamattomalta muutokselta. */
  function normalisoi() {
    T.osoite = T.osoite || {};
    T.linkit = T.linkit || {};
    T.some = T.some || {};
    T.lounas = T.lounas || {};
    T.aanestys = T.aanestys || {};
    T.tyonAlla = T.tyonAlla || {};
    T.tekstit = T.tekstit || {};
    T.ajankohtaista = T.ajankohtaista || [];
    T.saavutukset = T.saavutukset || [];
    T.menu = T.menu || {};
    T.menu.osiot = T.menu.osiot || [];
    T.menu.osiot.forEach(function (o) {
      o.annokset = o.annokset || [];
      o.huomiot = o.huomiot || [];
    });

    T.aukioloajat = T.aukioloajat || [];
    [1, 2, 3, 4, 5, 6, 0].forEach(function (nro) {
      var p = null;
      T.aukioloajat.forEach(function (x) { if (x.paiva === nro) p = x; });
      if (!p) { p = { paiva: nro, nimi: PAIVAT[nro], auki: null, kiinni: null }; T.aukioloajat.push(p); }
      p.nimi = PAIVAT[nro];
    });

    var L = T.lounaslista;
    [1, 2, 3, 4, 5].forEach(function (nro) {
      var p = null;
      L.paivat.forEach(function (x) { if (x.paiva === nro) p = x; });
      if (!p) { p = { paiva: nro, nimi: PAIVAT[nro], pvm: '', annokset: [] }; L.paivat.push(p); }
      p.nimi = PAIVAT[nro];
      p.annokset = p.annokset || [];
    });
    L.paivat.sort(function (a, b) { return a.paiva - b.paiva; });
  }

  function lataaSisalto() {
    // Lähtötilanne on content.js. Tietokannan sisältö kirjoitetaan sen päälle.
    T = kopio(OLETUS);
    return pyynto('/rest/v1/sisalto?select=avain,data').then(function (rivit) {
      (rivit || []).forEach(function (r) {
        if (!r.data || typeof r.data !== 'object') return;
        Object.keys(r.data).forEach(function (kentta) { T[kentta] = r.data[kentta]; });
      });
      normalisoi();
      Object.keys(RIVIT).forEach(function (avain) { ALKU[avain] = JSON.stringify(kerraa(avain)); });
    });
  }

  function tallennaOsio(avain, data) {
    return pyynto('/rest/v1/sisalto?avain=eq.' + encodeURIComponent(avain), {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ data: data, paivittaja: istunto.sposti || '' })
    });
  }

  function tallenna() {
    var avaimet = muuttuneet();
    if (!avaimet.length) return;
    $('#tallenna').disabled = true;
    $('#peru').disabled = true;
    naytaTila('Tallennetaan…');

    var ketju = Promise.resolve();
    avaimet.forEach(function (avain) {
      ketju = ketju.then(function () { return tallennaOsio(avain, kerraa(avain)); });
    });

    ketju.then(function () {
      avaimet.forEach(function (avain) { ALKU[avain] = JSON.stringify(kerraa(avain)); });
      muutoksia = false;
      naytaTila('Tallennettu · muutokset näkyvät sivustolla heti', 'on-onnistui');
      // Sivuston välimuisti vanhentuu, jotta selaimessa auki oleva sivu
      // saa tuoreen sisällön heti seuraavalla latauksella.
      try { localStorage.removeItem('liekki-sisalto'); } catch (e) {}
      setTimeout(function () { if (!muutoksia) naytaTila(); }, 4000);
    }).catch(function (e) {
      naytaTila('Tallennus ei onnistunut: ' + e.message, 'on-virhe');
      $('#tallenna').disabled = false;
      $('#peru').disabled = false;
    });
  }

  /* ============================================================ NÄKYMÄT */

  function naytaHallinta() {
    $('#kirjaudu').style.display = 'none';
    $('#kehys').classList.add('on-auki');
    $('#tunnus').textContent = istunto.sposti || '';
    lataaSisalto().then(function () {
      piirraValilehdet();
      piirraPaneelit();
      naytaTila();
    }).catch(function (e) {
      $('#sisus').innerHTML = '';
      var v = tee('p', 'viesti viesti--virhe',
        'Sisällön haku ei onnistunut: ' + e.message +
        (e.status === 401 ? ' Kirjaudu uudelleen.' : ''));
      lisaa($('#sisus'), v);
      if (e.status === 401) { unohdaIstunto(); setTimeout(naytaKirjautuminen, 1500); }
    });
  }

  function naytaKirjautuminen() {
    $('#kehys').classList.remove('on-auki');
    $('#kirjaudu').style.display = 'grid';
  }

  /* ============================================================== ALUSTUS */

  function alusta() {
    if (!API || !Y.avain) {
      $('#kirjautumisvirhe').hidden = false;
      $('#kirjautumisvirhe').textContent =
        'Yhteysasetukset puuttuvat. Täytä osoite ja avain tiedostoon assets/js/asetukset.js.';
      $('#kirjaudu-nappi').disabled = true;
      return;
    }

    lueIstunto();

    $('#kirjautumislomake').addEventListener('submit', function (e) {
      e.preventDefault();
      var virhe = $('#kirjautumisvirhe');
      virhe.hidden = true;
      var nappi = $('#kirjaudu-nappi');
      nappi.disabled = true;
      nappi.textContent = 'Kirjaudutaan…';

      fetch(API + '/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: { apikey: Y.avain, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: $('#sposti').value.trim(), password: $('#salasana').value })
      }).then(vastaus).then(function (j) {
        istunto = {
          token: j.access_token,
          refresh: j.refresh_token,
          sposti: (j.user && j.user.email) || $('#sposti').value.trim()
        };
        tallennaIstunto();
        $('#salasana').value = '';
        naytaHallinta();
      }).catch(function (err) {
        virhe.hidden = false;
        virhe.textContent = /invalid login/i.test(err.message)
          ? 'Sähköposti tai salasana ei täsmää.'
          : err.message;
      }).then(function () {
        nappi.disabled = false;
        nappi.textContent = 'Kirjaudu sisään';
      });
    });

    $('#ulos').addEventListener('click', function () {
      if (muutoksia && !window.confirm('Sinulla on tallentamattomia muutoksia. Kirjaudutaanko silti ulos?')) return;
      unohdaIstunto();
      location.reload();
    });

    $('#tallenna').addEventListener('click', tallenna);
    $('#peru').addEventListener('click', function () {
      if (!window.confirm('Perutaanko kaikki tallentamattomat muutokset?')) return;
      location.reload();
    });

    window.addEventListener('beforeunload', function (e) {
      if (!muutoksia) return;
      e.preventDefault();
      e.returnValue = '';
    });

    if (istunto.token) naytaHallinta(); else naytaKirjautuminen();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', alusta);
  } else { alusta(); }
})();
