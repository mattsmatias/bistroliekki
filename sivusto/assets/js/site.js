/* ==========================================================================
   BISTRO LIEKKI — sivuston toiminnallisuus
   Ei riippuvuuksia. Kaikki sisältö tulee tiedostosta content.js.
   ========================================================================== */
(function () {
  'use strict';

  var D = window.LIEKKI || {};
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var kevyt = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Sivuston juuri suhteessa nykyiseen sivuun ("" tai "../"), jotta
     content.js:n kuvapolut toimivat sekä etusivulla että alasivuilla. */
  var PERUSTA = (function () {
    var l = document.querySelector('link[rel="stylesheet"][href*="assets/css/style.css"]');
    return l ? l.getAttribute('href').replace('assets/css/style.css', '') : '';
  })();
  function polku(p) {
    if (!p) return p;
    if (/^(https?:)?\/\//.test(p) || p.charAt(0) === '/' || p.indexOf('data:') === 0) return p;
    return PERUSTA + p;
  }

  /* ------------------------------------------------------- apufunktioita */
  function minuutit(hhmm) {
    if (!hhmm) return null;
    var o = hhmm.split(':');
    return parseInt(o[0], 10) * 60 + parseInt(o[1], 10);
  }

  /* Ravintolan paikallinen aika (Europe/Helsinki) riippumatta kävijän
     laitteen aikavyöhykkeestä. */
  function ravintolanAika() {
    var nyt = new Date();
    try {
      var m = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Helsinki',
        weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(nyt);
      var osat = {};
      m.forEach(function (p) { osat[p.type] = p.value; });
      var vk = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return {
        paiva: vk[osat.weekday],
        min: parseInt(osat.hour, 10) * 60 + parseInt(osat.minute, 10)
      };
    } catch (e) {
      return { paiva: nyt.getDay(), min: nyt.getHours() * 60 + nyt.getMinutes() };
    }
  }

  function paivanTiedot(nro) {
    var lista = D.aukioloajat || [];
    for (var i = 0; i < lista.length; i++) if (lista[i].paiva === nro) return lista[i];
    return null;
  }

  function klo(min) {
    var h = Math.floor(min / 60) % 24, m = min % 60;
    return (h < 10 ? '0' : '') + h + '.' + (m < 10 ? '0' : '') + m;
  }

  /* ------------------------------------------------- 1. HEADERI + VALIKKO */
  function headeri() {
    var h = $('.headeri');
    if (!h) return;
    var raja = 40, tikittaa = false;
    function paivita() {
      h.classList.toggle('on-kiinni', window.scrollY > raja);
      tikittaa = false;
    }
    window.addEventListener('scroll', function () {
      if (!tikittaa) { tikittaa = true; window.requestAnimationFrame(paivita); }
    }, { passive: true });
    paivita();

    var palkki = $('[data-mobiilipalkki]');
    if (palkki) {
      var nakyy = false;
      var seuraa = function () {
        var raja = Math.min(window.innerHeight * .75, 640);
        var pitaisi = window.scrollY > raja;
        if (pitaisi !== nakyy) { nakyy = pitaisi; palkki.classList.toggle('on-nakyvissa', nakyy); }
      };
      window.addEventListener('scroll', seuraa, { passive: true });
      seuraa();
    }

    var nappi = $('.valikkonappi');
    var valikko = $('.mobiilivalikko');
    if (!nappi || !valikko) return;

    function aseta(auki) {
      nappi.setAttribute('aria-expanded', auki ? 'true' : 'false');
      valikko.classList.toggle('on-auki', auki);
      valikko.setAttribute('aria-hidden', auki ? 'false' : 'true');
      document.body.classList.toggle('is-locked', auki);
    }
    nappi.addEventListener('click', function () {
      aseta(nappi.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', valikko).forEach(function (a) {
      a.addEventListener('click', function () { aseta(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && valikko.classList.contains('on-auki')) { aseta(false); nappi.focus(); }
    });
    var mq = window.matchMedia('(min-width: 1080px)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function (e) {
      if (e.matches) aseta(false);
    });
  }

  /* ---------------------------------------------- 2. AUKIOLO — ELÄVÄ TILA */
  /* Lounastilanne on oma funktionsa, koska se näkyy myös sivuilla joilla ei
     ole aukiolopalkkia lainkaan (esim. Lounas-sivun hero). */
  function lounastila() {
    var kentat = $$('[data-lounastila]');
    if (!kentat.length) return;

    var t = ravintolanAika();
    var l = D.lounas || {};
    var arkena = l.paivat && l.paivat.indexOf(t.paiva) !== -1;
    var nyt = arkena && t.min >= minuutit(l.auki) && t.min < minuutit(l.kiinni);

    kentat.forEach(function (el) {
      // "elava" = näytetään vain kun tieto on tuoreempi kuin aikataulu, joka
      // lukee jo sivulla. Muuten kenttä jää tyhjäksi ja piiloutuu.
      var vainElava = el.getAttribute('data-lounastila') === 'elava';

      if (nyt) {
        el.textContent = 'Lounasbuffet on tarjolla juuri nyt — klo ' + l.kiinni + ' asti.';
      } else if (arkena && t.min < minuutit(l.auki)) {
        el.textContent = 'Lounas alkaa tänään klo ' + l.auki + '.';
      } else if (vainElava) {
        el.textContent = '';
      } else {
        el.textContent = 'Lounasta tarjoillaan ' + (l.paivatTeksti || 'arkisin').toLowerCase() +
                         ' klo ' + l.auki + '–' + l.kiinni + '.';
      }
      el.classList.toggle('korostus', nyt);
      el.classList.toggle('on-nyt', nyt);
    });
  }

  function aukiolotila() {
    var laatikot = $$('[data-tila]');
    if (!laatikot.length) return;

    var t = ravintolanAika();
    var tanaan = paivanTiedot(t.paiva);
    var tila = 'kiinni', otsikko = 'Suljettu', rivi = '';
    var keittio = D.keittioSulkeutuuEnnen || 0;

    if (tanaan && tanaan.auki && tanaan.kiinni) {
      var a = minuutit(tanaan.auki), k = minuutit(tanaan.kiinni);
      if (k <= a) k += 24 * 60;                       // yli puolenyön
      if (t.min >= a && t.min < k) {
        tila = 'auki';
        otsikko = 'Olemme avoinna';
        rivi = tanaan.auki + '–' + tanaan.kiinni;
        var jaljella = k - t.min;
        if (jaljella <= 60) { tila = 'kohta'; otsikko = 'Sulkeutuu pian'; }
        if (keittio && jaljella <= keittio) { otsikko = 'Keittiö on sulkeutunut'; }
      } else if (t.min < a) {
        tila = 'kiinni';
        otsikko = 'Suljettu';
        rivi = 'Avaamme tänään klo ' + tanaan.auki;
      }
    }

    if (tila === 'kiinni' && !rivi) {
      for (var i = 1; i <= 7; i++) {
        var s = paivanTiedot((t.paiva + i) % 7);
        if (s && s.auki) {
          rivi = (i === 1 ? 'Avaamme huomenna klo ' : 'Avaamme ' + s.nimi.toLowerCase() + 'na klo ') + s.auki;
          break;
        }
      }
    }

    laatikot.forEach(function (el) {
      el.classList.remove('tila--auki', 'tila--kiinni', 'tila--kohta');
      el.classList.add('tila--' + tila);
      var o = $('[data-tila-otsikko]', el);
      var r = $('[data-tila-aika]', el);
      if (o) o.textContent = otsikko;
      if (r) r.innerHTML = rivi ? (tila === 'auki' ? '<strong>' + rivi + '</strong>' : rivi) : '';
    });

    // Korosta tämä päivä aukiololistoissa
    $$('.aukiolot li').forEach(function (li) {
      li.classList.toggle('on-tanaan', parseInt(li.getAttribute('data-paiva'), 10) === t.paiva);
    });

  }

  /* ---------------------------------------- 3. SISÄLLÖN SIJOITUS SIVUILLE */
  function taytaTiedot() {
    var kartta = {
      nimi: D.nimi,
      puhelin: D.puhelin,
      'varaus-puhelin': D.varausPuhelin,
      sahkoposti: D.sahkoposti,
      'keittio-sahkoposti': D.keittioSahkoposti,
      katu: D.osoite && D.osoite.katu,
      postitoimi: D.osoite ? D.osoite.postinumero + ' ' + D.osoite.kaupunki : '',
      vuosi: String(new Date().getFullYear()),
      'lounas-aika': D.lounas ? D.lounas.auki + '–' + D.lounas.kiinni : '',
      'lounas-paivat': D.lounas ? D.lounas.paivatTeksti : '',
      'lounas-paivat-pieni': D.lounas && D.lounas.paivatTeksti
        ? D.lounas.paivatTeksti.charAt(0).toLowerCase() + D.lounas.paivatTeksti.slice(1) : '',
      'lounas-hinta': D.lounas ? D.lounas.hinta : '',
      'tiktok-seuraajat': D.tiktokSeuraajat || '',
      keittio: D.keittioSulkeutuuEnnen ? 'Keittiö sulkee ' + D.keittioSulkeutuuEnnen + ' min ennen ravintolan sulkemisaikaa.' : ''
    };
    Object.keys(kartta).forEach(function (avain) {
      $$('[data-teksti="' + avain + '"]').forEach(function (el) {
        if (kartta[avain]) el.textContent = kartta[avain];
        else if (el.dataset.piilotaTyhjana !== undefined) {
          el.hidden = true;
          var ryhma = el.closest('[data-piilota-ryhma]');
          if (ryhma) ryhma.hidden = true;
        }
      });
    });

    // Puhelin- ja sähköpostilinkit
    $$('[data-href="puhelin"]').forEach(function (a) { a.href = 'tel:' + (D.puhelinHref || ''); });
    $$('[data-href="varaus-puhelin"]').forEach(function (a) { a.href = 'tel:' + (D.varausPuhelinHref || ''); });
    $$('[data-href="sahkoposti"]').forEach(function (a) { a.href = 'mailto:' + (D.sahkoposti || ''); });
    $$('[data-href="keittio-sahkoposti"]').forEach(function (a) {
      a.href = 'mailto:' + (D.keittioSahkoposti || D.sahkoposti || '');
    });

    // Ulkoiset linkit content.js:stä. Puuttuva osoite -> kohtelias "tulossa".
    $$('[data-linkki]').forEach(function (a) {
      var avain = a.getAttribute('data-linkki');
      var url = (D.linkit || {})[avain] || '';
      if (url) {
        a.href = url;
        if (url.indexOf('http') === 0 && url.indexOf(location.hostname) === -1) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
      } else {
        // Osoitetta ei ole vielä lisätty content.js:ään.
        // Jos varareitti on määritelty (esim. puhelinnumero tai yhteyssivu),
        // painike ohjaa sinne — käyttäjä ei koskaan törmää kuolleeseen linkkiin.
        var varaTeksti = a.getAttribute('data-tyhjana');
        var varaHref = a.getAttribute('data-vara-href');
        if (varaHref === 'puhelin') varaHref = 'tel:' + (D.puhelinHref || '');
        if (varaHref === 'varaus-puhelin') varaHref = 'tel:' + (D.varausPuhelinHref || '');
        if (varaHref === 'sahkoposti') varaHref = 'mailto:' + (D.sahkoposti || '');

        if (varaHref) {
          a.href = varaHref;
        } else {
          a.removeAttribute('href');
          a.setAttribute('aria-disabled', 'true');
        }
        if (varaTeksti) {
          var s = $('span', a) || a;
          s.textContent = varaTeksti;
        }
        if (a.hasAttribute('data-piilota-tyhjana')) {
          var laatikko = a.closest('[data-linkkilaatikko]') || a;
          laatikko.hidden = true;
        }
      }
    });

    // Some-linkit
    $$('[data-some]').forEach(function (a) {
      var url = (D.some || {})[a.getAttribute('data-some')] || '';
      if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener me'; }
      else { a.remove(); }
    });

    // Kartta ladataan vasta kun se tulee näkyviin
    $$('[data-kartta]').forEach(function (kehys) {
      var url = (D.linkit || {}).kartta;
      if (!url) return;
      var lataa = function () {
        var f = document.createElement('iframe');
        f.src = url;
        f.loading = 'lazy';
        f.title = 'Kartta: ' + (D.osoite ? D.osoite.katu + ', ' + D.osoite.postinumero + ' ' + D.osoite.kaupunki : 'Bistro Liekki');
        f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
        f.allowFullscreen = true;
        kehys.textContent = '';
        kehys.appendChild(f);
      };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (merkit) {
          merkit.forEach(function (m) { if (m.isIntersecting) { lataa(); io.disconnect(); } });
        }, { rootMargin: '300px' });
        io.observe(kehys);
      } else { lataa(); }
    });
  }

  /* ------------------------------------------------- 4. AJANKOHTAISTA */
  function ajankohtaista() {
    var lista = (D.ajankohtaista || []).filter(function (i) {
      if (!i.paattyy) return true;
      var p = new Date(i.paattyy + 'T23:59:59');
      return p >= new Date();
    }).filter(function (i) {
      if (!i.alkaa) return true;
      return new Date(i.alkaa + 'T00:00:00') <= new Date();
    });

    var palkki = $('[data-ilmoituspalkki]');
    if (palkki) {
      var korostettu = lista.filter(function (i) { return i.korosta; })[0];
      if (korostettu) {
        $('[data-ilmoitus-otsikko]', palkki).textContent = korostettu.otsikko;
        $('[data-ilmoitus-teksti]', palkki).textContent = korostettu.teksti;
        palkki.hidden = false;
      }
    }

    var kehys = $('[data-uutiset]');
    if (!kehys) return;
    // Ei ilmoituksia -> koko osio jää pois. Sivulla ei näy tyhjää laatikkoa.
    if (!lista.length) return;
    var osio = kehys.closest('[data-uutisosio]');
    if (osio) osio.hidden = false;
    kehys.innerHTML = lista.map(function (i) {
      var pvm = '';
      if (i.alkaa) {
        try {
          pvm = new Intl.DateTimeFormat('fi-FI', { day: 'numeric', month: 'long' }).format(new Date(i.alkaa + 'T00:00:00'));
        } catch (e) { pvm = i.alkaa; }
      }
      return '<article class="uutinen">' +
        (pvm ? '<time datetime="' + i.alkaa + '">' + pvm + '</time>' : '') +
        '<h3>' + i.otsikko + '</h3><p>' + i.teksti + '</p></article>';
    }).join('');
  }

  /* ---------------------------------------------------- 5. AUKIOLOLISTA */
  function aukiololista() {
    $$('[data-aukiolot]').forEach(function (ul) {
      var jarjestys = [1, 2, 3, 4, 5, 6, 0];
      ul.innerHTML = jarjestys.map(function (n) {
        var p = paivanTiedot(n);
        if (!p) return '';
        var suljettu = !p.auki;
        return '<li data-paiva="' + n + '"' + (suljettu ? ' class="on-kiinni"' : '') + '>' +
          '<span class="paiva">' + p.nimi + '</span>' +
          '<span class="kello">' + (suljettu ? 'Suljettu' : p.auki + '–' + p.kiinni) + '</span></li>';
      }).join('');
    });
  }

  /* --------------------------------------------------------- 6. GALLERIA */
  function galleria() {
    var kuvat = D.galleria || [];
    $$('[data-galleria]').forEach(function (kehys) {
      if (!kuvat.length) return;
      var maara = parseInt(kehys.getAttribute('data-galleria'), 10) || kuvat.length;
      kehys.innerHTML = kuvat.slice(0, maara).map(function (k, i) {
        var lk = k.koko === 'iso' ? ' galleria__kohde--iso' : (k.koko === 'pysty' ? ' galleria__kohde--pysty' : '');
        return '<button type="button" class="galleria__kohde' + lk + '" data-kuva="' + i + '" aria-label="Avaa kuva: ' + k.alt + '">' +
          '<img src="' + polku(k.kuva) + '" alt="' + k.alt + '" loading="lazy" decoding="async" width="1500" height="1100">' +
          '</button>';
      }).join('');
    });

    var laatikko = $('[data-valolaatikko]');
    if (!laatikko) return;
    var kuva = $('img', laatikko);
    var teksti = $('[data-valolaatikko-teksti]', laatikko);
    var nykyinen = 0, palaa = null;

    function nayta(i) {
      nykyinen = (i + kuvat.length) % kuvat.length;
      kuva.src = polku(kuvat[nykyinen].kuva);
      kuva.alt = kuvat[nykyinen].alt;
      kuva.hidden = false;
      if (teksti) teksti.textContent = kuvat[nykyinen].alt + '  ·  ' + (nykyinen + 1) + '/' + kuvat.length;
    }
    function avaa(i, lahde) {
      palaa = lahde;
      nayta(i);
      laatikko.classList.add('on-auki');
      laatikko.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      $('.valolaatikko__sulje', laatikko).focus();
      zoomaaSisaan(lahde);
    }

    /* Kuva kasvaa juuri siitä pikkukuvasta, jota napsautettiin. */
    function zoomaaSisaan(lahde) {
      if (kevyt || !lahde || !kuva.animate) return;
      var pikku = lahde.querySelector('img');
      if (!pikku) return;
      var a = pikku.getBoundingClientRect();
      requestAnimationFrame(function () {
        var b = kuva.getBoundingClientRect();
        if (!b.width || !b.height) return;
        var sx = a.width / b.width, sy = a.height / b.height;
        var dx = (a.left + a.width / 2) - (b.left + b.width / 2);
        var dy = (a.top + a.height / 2) - (b.top + b.height / 2);
        kuva.animate([
          { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')', opacity: .65 },
          { transform: 'none', opacity: 1 }
        ], { duration: 460, easing: 'cubic-bezier(.16,1,.3,1)' });
      });
    }
    function sulje() {
      laatikko.classList.remove('on-auki');
      laatikko.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-locked');
      if (palaa) palaa.focus();
    }

    document.addEventListener('click', function (e) {
      var nappi = e.target.closest('[data-kuva]');
      if (nappi) { avaa(parseInt(nappi.getAttribute('data-kuva'), 10), nappi); return; }
      if (e.target.closest('.valolaatikko__sulje') || e.target === laatikko) sulje();
      if (e.target.closest('.valolaatikko__nuoli--edell')) nayta(nykyinen - 1);
      if (e.target.closest('.valolaatikko__nuoli--seur')) nayta(nykyinen + 1);
    });
    document.addEventListener('keydown', function (e) {
      if (!laatikko.classList.contains('on-auki')) return;
      if (e.key === 'Escape') sulje();
      if (e.key === 'ArrowLeft') nayta(nykyinen - 1);
      if (e.key === 'ArrowRight') nayta(nykyinen + 1);
    });
  }

  /* ----------------------------------------------------------- 7. TIKTOK */
  /* Yleiskäyttöinen karuselli: pyyhkäisy puhelimella, nuolet työpöydällä,
     pisteet kertovat missä kohtaa ollaan. Kortit napsahtavat paikalleen. */
  function karuselli(kehys) {
    var rata = $('.karuselli__rata', kehys);
    if (!rata) return;
    var kortit = Array.prototype.slice.call(rata.children);
    if (kortit.length < 2) return;

    var edell = $('.karuselli__nappi--edell', kehys);
    var seur  = $('.karuselli__nappi--seur', kehys);
    var pisteet = $('.karuselli__pisteet', kehys);

    if (pisteet) {
      pisteet.innerHTML = kortit.map(function (_, i) {
        return '<button type="button" class="karuselli__piste' + (i ? '' : ' on') +
               '" aria-label="Siirry kohtaan ' + (i + 1) + '"></button>';
      }).join('');
      $$('.karuselli__piste', pisteet).forEach(function (nappi, i) {
        nappi.addEventListener('click', function () {
          rata.scrollTo({ left: kortit[i].offsetLeft - rata.offsetLeft, behavior: kevyt ? 'auto' : 'smooth' });
        });
      });
    }

    function askel() {
      var r = kortit[0].getBoundingClientRect();
      var vali = parseFloat(getComputedStyle(rata).columnGap || '12') || 12;
      return r.width + vali;
    }
    function siirra(suunta) {
      rata.scrollBy({ left: suunta * askel(), behavior: kevyt ? 'auto' : 'smooth' });
    }
    if (edell) edell.addEventListener('click', function () { siirra(-1); });
    if (seur)  seur.addEventListener('click', function () { siirra(1); });

    var tikittaa = false;
    function paivita() {
      tikittaa = false;
      var x = rata.scrollLeft;
      var maks = rata.scrollWidth - rata.clientWidth;
      // Jos kaikki kortit mahtuvat kerralla näkyviin, pisteet ja reunahäivyt
      // ovat turhia — piilotetaan ne, ettei näytä rikkinäiseltä.
      kehys.classList.toggle('on-mahtuu', maks <= 8);
      kehys.classList.toggle('on-alkua-ennen', x > 8);
      kehys.classList.toggle('on-loppua-jaljella', x < maks - 8);
      if (edell) edell.disabled = x <= 8;
      if (seur)  seur.disabled  = x >= maks - 8;

      if (pisteet) {
        var lahin = 0, ero = Infinity;
        kortit.forEach(function (k, i) {
          var d = Math.abs((k.offsetLeft - rata.offsetLeft) - x);
          if (d < ero) { ero = d; lahin = i; }
        });
        $$('.karuselli__piste', pisteet).forEach(function (n, i) {
          n.classList.toggle('on', i === lahin);
        });
      }
    }
    rata.addEventListener('scroll', function () {
      if (!tikittaa) { tikittaa = true; requestAnimationFrame(paivita); }
    }, { passive: true });
    window.addEventListener('resize', paivita, { passive: true });

    // Nuolinäppäimet, kun rata on kohdistettuna
    rata.setAttribute('tabindex', '0');
    rata.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); siirra(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); siirra(-1); }
    });

    paivita();
    setTimeout(paivita, 1200);
    return paivita;
  }

  /* Näyttää ravintolan TikTok-videot sivulla.
     - content.js:ssä videoiden tunnukset -> selattava karuselli, yksi video per kortti
     - tyhjä lista -> TikTokin oma profiiliupotus, joka päivittyy itsestään
     - upotus estetty -> ravintolan omat kuvat samassa karusellissa */
  function tiktok() {
    var kehys = $('[data-tiktok]');
    if (!kehys) return;

    var profiili = ((D.some || {}).tiktok || '').replace(/\/+$/, '');
    if (!profiili) { var os = kehys.closest('section'); if (os) os.remove(); return; }

    var tunnus = (profiili.match(/@([\w.\-]+)/) || [])[1] || '';
    var videot = (D.tiktokVideot || []).slice(0, 8);
    var vara = $('[data-tiktok-vara]');
    var karuselliKehys = kehys.closest('.karuselli');

    if (videot.length) {
      kehys.className = 'karuselli__rata';
      kehys.innerHTML = videot.map(function (v) {
        var url = profiili + '/video/' + v.id;
        return '<div class="tiktok-kortti-video">' +
          '<blockquote class="tiktok-embed" cite="' + url + '" data-video-id="' + v.id + '">' +
          '<section><a target="_blank" rel="noopener" href="' + url + '">' +
          (v.teksti || 'Katso TikTokissa') + '</a></section></blockquote></div>';
      }).join('');
      if (karuselliKehys) karuselliKehys.hidden = false;
    } else {
      // Ei erikseen valittuja videoita: TikTokin oma profiilinäkymä
      if (karuselliKehys) karuselliKehys.remove();
      var syote = document.createElement('div');
      syote.className = 'tiktok-syote tiktok-syote--profiili';
      syote.setAttribute('data-tiktok-syote', '');
      syote.innerHTML = '<blockquote class="tiktok-embed" cite="' + profiili +
        '" data-unique-id="' + tunnus + '" data-embed-type="creator"' +
        ' style="max-width:780px;min-width:288px"><section><a target="_blank" rel="noopener" href="' +
        profiili + '">@' + tunnus + '</a></section></blockquote>';
      if (vara && vara.parentNode) vara.parentNode.insertBefore(syote, vara);
      kehys = syote;
    }

    var paivitaKaruselli = karuselliKehys && videot.length ? karuselli(karuselliKehys) : null;

    function naytaVara() {
      if (!vara) return;
      var poistettava = karuselliKehys && videot.length ? karuselliKehys : kehys;
      if (poistettava) poistettava.hidden = true;
      vara.hidden = false;
      var vk = vara.querySelector('.karuselli');
      if (vk) karuselli(vk);
    }

    function lataa() {
      if (!document.getElementById('tiktok-embed-js')) {
        var sk = document.createElement('script');
        sk.id = 'tiktok-embed-js';
        sk.async = true;
        sk.src = 'https://www.tiktok.com/embed.js';
        sk.onerror = naytaVara;
        document.body.appendChild(sk);
      }
      var alku = Date.now();
      var vahti = setInterval(function () {
        var kohde = karuselliKehys && videot.length ? karuselliKehys : kehys;
        if (kohde && kohde.querySelector('iframe')) {
          clearInterval(vahti);
          kohde.classList.add('on-ladattu');
          if (paivitaKaruselli) setTimeout(paivitaKaruselli, 400);
        } else if (Date.now() - alku > 6000) {
          clearInterval(vahti);
          naytaVara();
        }
      }, 400);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (m) {
        m.forEach(function (x) { if (x.isIntersecting) { lataa(); io.disconnect(); } });
      }, { rootMargin: '500px' });
      io.observe(kehys);
    } else { lataa(); }
  }


  /* ======================================================================
     EFEKTIT
     Yksi vieritysssilmukka hoitaa kaikki liikkeet, jotta selain ei joudu
     tekemään samaa työtä moneen kertaan. Kaikki liike ohitetaan, jos
     käyttäjä on valinnut "vähennä liikettä".
     ====================================================================== */

  var kosketus = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ------------------------------------------------- E1. SIVUN AVAUS */
  function esirippu() {
    var v = $('[data-esirippu]');
    if (!v) return;
    var juuri = document.documentElement;

    var nahty = false;
    try { nahty = sessionStorage.getItem('liekki-esirippu') === '1'; } catch (e) {}
    if (kevyt || nahty) { v.remove(); return; }

    juuri.classList.add('esirippu-paalla');
    try { sessionStorage.setItem('liekki-esirippu', '1'); } catch (e) {}

    var poistettu = false;
    function pois() {
      if (poistettu) return;
      poistettu = true;
      v.classList.add('on-poistuu');
      juuri.classList.remove('esirippu-paalla');
      setTimeout(function () { if (v.parentNode) v.remove(); }, 1100);
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { v.classList.add('on-kaynnissa'); });
    });
    setTimeout(pois, 1150);
    setTimeout(pois, 3000);                       // varmistus, jos jokin takkuaa
    v.addEventListener('click', pois);
    document.addEventListener('keydown', pois, { once: true });
  }

  /* --------------------------------------- E2. OTSIKOT SANA KERRALLAAN */
  function jaaSanoiksi() {
    if (kevyt) return;
    $$('[data-sanat]').forEach(function (el) {
      if (el.dataset.jaettu) return;
      el.dataset.jaettu = '1';
      var laskuri = 0;

      (function kayLapi(solmu) {
        var lapset = Array.prototype.slice.call(solmu.childNodes);
        lapset.forEach(function (n) {
          if (n.nodeType === 3) {                            // tekstisolmu
            var osat = n.textContent.split(/(\s+)/);
            var kehys = document.createDocumentFragment();
            osat.forEach(function (osa) {
              if (!osa) return;
              if (/^\s+$/.test(osa)) { kehys.appendChild(document.createTextNode(osa)); return; }
              var ulko = document.createElement('span');
              ulko.className = 'sana';
              var sisa = document.createElement('i');
              sisa.textContent = osa;
              sisa.style.setProperty('--s', laskuri++);
              ulko.appendChild(sisa);
              kehys.appendChild(ulko);
            });
            solmu.replaceChild(kehys, n);
          } else if (n.nodeType === 1 && n.tagName !== 'BR') {
            kayLapi(n);
          }
        });
      })(el);
    });
  }

  /* ------------------------------------------------------- E3. LASKURI */
  function laskurit() {
    $$('[data-laskuri]').forEach(function (el) {
      var kohdeTeksti = (el.textContent || '').trim();
      var luvut = kohdeTeksti.replace(/\s/g, '').match(/\d+/);
      if (!luvut) return;
      var kohde = parseInt(luvut[0], 10);
      var alku = parseInt(el.getAttribute('data-laskuri'), 10);
      if (isNaN(alku)) alku = 0;
      if (kevyt || !('IntersectionObserver' in window)) return;

      var muoto = function (n) {
        return kohdeTeksti.replace(/[\d\s]*\d/, kohde > 9999
          ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
          : String(n));
      };

      var io = new IntersectionObserver(function (m) {
        m.forEach(function (x) {
          if (!x.isIntersecting) return;
          io.disconnect();
          var kesto = 1100, t0 = null;
          function askel(t) {
            if (!t0) t0 = t;
            var pr = Math.min((t - t0) / kesto, 1);
            var e = 1 - Math.pow(1 - pr, 3);
            el.textContent = muoto(Math.round(alku + (kohde - alku) * e));
            if (pr < 1) requestAnimationFrame(askel);
            else el.textContent = kohdeTeksti;
          }
          requestAnimationFrame(askel);
        });
      }, { threshold: .5 });
      io.observe(el);
    });
  }

  /* --------------------------------------- E4. VIERITYS: PALKKI JA SYVYYS */
  function vierityssilmukka() {
    var palkki = $('[data-vieritys]');
    var heroMedia = $('.hero__media');
    var heroSisus = $('.hero__sisus');
    var kerrokset = $$('[data-parallaksi]');
    if (!palkki && !heroMedia && !kerrokset.length) return;

    var liikkuu = !kevyt && !kosketus;
    var tikittaa = false;

    function paivita() {
      tikittaa = false;
      var y = window.scrollY;

      if (palkki) {
        var korkeus = document.documentElement.scrollHeight - window.innerHeight;
        palkki.style.transform = 'scaleX(' + (korkeus > 0 ? Math.min(y / korkeus, 1) : 0) + ')';
      }
      if (!liikkuu) return;

      if (heroMedia) {
        var ikkuna = window.innerHeight;
        if (y < ikkuna * 1.2) {
          heroMedia.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0)';
          if (heroSisus) {
            var h = Math.max(0, 1 - y / (ikkuna * 0.62));
            heroSisus.style.opacity = h.toFixed(3);
            heroSisus.style.transform = 'translate3d(0,' + (y * 0.09).toFixed(1) + 'px,0)';
          }
        }
      }

      kerrokset.forEach(function (el) {
        var media = el.querySelector('.band__media, .sivuhero__media');
        if (!media) return;
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        var keskus = r.top + r.height / 2 - window.innerHeight / 2;
        media.style.transform = 'translate3d(0,' + (keskus * -0.11).toFixed(1) + 'px,0) scale(1.14)';
      });
    }

    window.addEventListener('scroll', function () {
      if (!tikittaa) { tikittaa = true; requestAnimationFrame(paivita); }
    }, { passive: true });
    window.addEventListener('resize', paivita, { passive: true });
    paivita();
  }

  /* ------------------------------------------------- E5. KURSORIN HEHKU */
  function kursorihehku() {
    if (kosketus || kevyt) return;
    var valitsin = '.nappi, .kortti, .lounas-kortti, .luku, .uutinen';
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest ? e.target.closest(valitsin) : null;
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
  }

  /* ------------------------------------------- E6. KIPINÄT VÄISTÄVÄT HIIRTÄ */
  var kipinaOsoitin = { x: -9999, y: -9999 };

  /* ------------------------------------------------- 8. SCROLL REVEAL */
  function esiin() {
    var kohteet = $$('[data-esiin], [data-verho], [data-sanat]');
    if (!kohteet.length) return;

    function nayta(el) {
      el.classList.add('on-nakyvissa');
      // Kuvaverhot aukeavat samalla kun niitä ympäröivä lohko paljastuu
      $$('[data-verho]', el).forEach(function (v) { v.classList.add('on-nakyvissa'); });
    }

    if (kevyt || !('IntersectionObserver' in window)) {
      kohteet.forEach(nayta);
      return;
    }
    var io = new IntersectionObserver(function (merkit) {
      merkit.forEach(function (m) {
        if (m.isIntersecting) { nayta(m.target); io.unobserve(m.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    kohteet.forEach(function (el) { io.observe(el); });

    // Varmistus: sisältö ei saa koskaan jäädä piiloon, vaikka jokin takkuaisi
    setTimeout(function () {
      $$('[data-sanat]').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) nayta(el);
      });
    }, 2500);
  }

  /* ------------------------------------------------ 9. HERON KIPINÄT */
  function kipinat() {
    var kehys = $('[data-kipinat]');
    if (!kehys || kevyt) return;
    if (window.matchMedia('(max-width: 700px)').matches && navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) return;

    kehys.addEventListener('pointermove', function (e) {
      var r = kehys.getBoundingClientRect();
      kipinaOsoitin.x = e.clientX - r.left;
      kipinaOsoitin.y = e.clientY - r.top;
    }, { passive: true });
    kehys.addEventListener('pointerleave', function () {
      kipinaOsoitin.x = kipinaOsoitin.y = -9999;
    }, { passive: true });

    var c = document.createElement('canvas');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'width:100%;height:100%;display:block';
    kehys.appendChild(c);
    var ctx = c.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, hiukkaset = [], kaynnissa = true, id = null;

    function mitoita() {
      w = kehys.clientWidth; h = kehys.clientHeight;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function luo(alku) {
      return {
        x: Math.random() * w,
        y: alku ? Math.random() * h : h + Math.random() * 60,
        r: Math.random() * 1.5 + .35,
        nopeus: Math.random() * .38 + .12,
        ajelehdus: (Math.random() - .5) * .28,
        vaihe: Math.random() * Math.PI * 2,
        elama: Math.random() * .5 + .5
      };
    }
    function alusta() {
      mitoita();
      var maara = Math.max(16, Math.min(52, Math.round(w / 34)));
      hiukkaset = [];
      for (var i = 0; i < maara; i++) hiukkaset.push(luo(true));
    }
    function piirra() {
      if (!kaynnissa) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < hiukkaset.length; i++) {
        var p = hiukkaset[i];
        p.y -= p.nopeus;
        p.vaihe += .022;
        p.x += p.ajelehdus + Math.sin(p.vaihe) * .28;

        // Osoitin työntää kipinöitä pehmeästi sivuun
        var dx = p.x - kipinaOsoitin.x, dy = p.y - kipinaOsoitin.y;
        var et2 = dx * dx + dy * dy;
        if (et2 < 16900) {
          var voima = (1 - Math.sqrt(et2) / 130) * 1.5;
          p.x += dx * voima * .05;
          p.y += dy * voima * .05;
        }
        if (p.y < -20) hiukkaset[i] = luo(false);
        var a = Math.max(0, Math.min(1, (p.y / h))) * p.elama * .75;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        g.addColorStop(0, 'rgba(255,186,120,' + a + ')');
        g.addColorStop(.35, 'rgba(233,116,59,' + (a * .5) + ')');
        g.addColorStop(1, 'rgba(201,85,42,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      id = requestAnimationFrame(piirra);
    }

    alusta();
    piirra();

    var aika = null;
    window.addEventListener('resize', function () {
      clearTimeout(aika);
      aika = setTimeout(alusta, 220);
    }, { passive: true });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { kaynnissa = false; if (id) cancelAnimationFrame(id); }
      else if (!kaynnissa) { kaynnissa = true; piirra(); }
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (m) {
        m.forEach(function (x) {
          if (x.isIntersecting) { if (!kaynnissa) { kaynnissa = true; piirra(); } }
          else { kaynnissa = false; if (id) cancelAnimationFrame(id); }
        });
      }, { threshold: 0 }).observe(kehys);
    }
  }

  /* -------------------------------------------------------- 10. LOMAKKEET */
  function lomakkeet() {
    $$('form[data-lomake]').forEach(function (f) {
      var avattu = Date.now();
      var viesti = $('[data-lomake-viesti]', f);

      f.addEventListener('submit', function (e) {
        e.preventDefault();

        // Roskapostisuoja ilman captchaa: piilokenttä + minimiaika
        var hunaja = $('input[name="yritys"]', f);
        if (hunaja && hunaja.value) return;
        if (Date.now() - avattu < 2500) {
          nayta('virhe', 'Odota hetki ja yritä uudelleen.');
          return;
        }

        if (!f.checkValidity()) {
          f.reportValidity();
          return;
        }

        var data = new FormData(f);
        var osoite = D.lomakeOsoite;
        // Taustajärjestelmä saa tiedon oikeasta vastaanottajasta
        if (f.hasAttribute('data-vastaanottaja')) {
          data.append('vastaanottaja', f.getAttribute('data-vastaanottaja'));
        }

        if (osoite) {
          var nappi = $('button[type="submit"]', f);
          if (nappi) { nappi.disabled = true; }
          fetch(osoite, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
            .then(function (r) {
              if (!r.ok) throw new Error('virhe');
              f.reset();
              nayta('ok', f.getAttribute('data-kiitos') || 'Kiitos viestistäsi! Olemme yhteydessä pian.');
            })
            .catch(function () {
              nayta('virhe', 'Lähetys ei onnistunut. Soita meille numeroon ' + (D.puhelin || '') + '.');
            })
            .then(function () { if (nappi) nappi.disabled = false; });
        } else {
          // Taustajärjestelmää ei ole vielä kytketty: avataan sähköpostiviesti.
          var otsikko = f.getAttribute('data-aihe') || 'Viesti verkkosivulta';
          var runko = [];
          data.forEach(function (arvo, avain) {
            if (avain === 'yritys' || !String(arvo).trim()) return;
            runko.push(avain.charAt(0).toUpperCase() + avain.slice(1) + ': ' + arvo);
          });
          // Lomake voi ohjata viestin eri osoitteeseen (esim. keittiön palaute)
          var saaja = f.getAttribute('data-vastaanottaja') || D.sahkoposti || '';
          window.location.href = 'mailto:' + saaja +
            '?subject=' + encodeURIComponent(otsikko) +
            '&body=' + encodeURIComponent(runko.join('\n'));
          nayta('ok', 'Avasimme viestin sähköpostiohjelmaasi. Voit myös soittaa: ' + (D.puhelin || '') + '.');
        }
      });

      function nayta(tyyppi, teksti) {
        if (!viesti) return;
        viesti.hidden = false;
        viesti.className = 'lomake__viesti lomake__viesti--' + tyyppi;
        viesti.textContent = teksti;
        viesti.setAttribute('role', 'status');
      }
    });
  }

  /* ------------------------------------------ 10a. ILMOITUS: ÄÄNESTYS */
  /* Edenredin Suomen Paras Lounas -äänestys. Nousee esiin heti sivulle
     tultaessa; sulkeminen muistetaan käynnin ajan. */
  function aanestys() {
    var laatikko = $('[data-aanestys]');
    if (!laatikko) return;

    var a = D.aanestys || {};
    if (!a.naytetaan || !a.linkki) { laatikko.remove(); return; }

    var suljettu = false;
    try { suljettu = sessionStorage.getItem('liekki-aanestys') === 'kiinni'; } catch (e) {}
    if (suljettu) { laatikko.remove(); return; }

    function aseta(valitsin, teksti) {
      var el = $(valitsin, laatikko);
      if (!el) return;
      if (teksti) el.textContent = teksti; else el.remove();
    }
    aseta('[data-aanestys-ylatunnus]', a.ylatunnus);
    aseta('[data-aanestys-otsikko]', a.otsikko);
    aseta('[data-aanestys-teksti]', a.teksti);
    aseta('[data-aanestys-painike]', a.painike || 'Äänestä');

    var linkki = $('[data-aanestys-linkki]', laatikko);
    if (linkki) linkki.href = a.linkki;

    laatikko.hidden = false;
    setTimeout(function () { laatikko.classList.add('on-nakyvissa'); }, kevyt ? 0 : 700);

    var nappi = $('[data-aanestys-sulje]', laatikko);
    if (nappi) {
      nappi.addEventListener('click', function () {
        laatikko.classList.add('on-poistuu');
        try { sessionStorage.setItem('liekki-aanestys', 'kiinni'); } catch (e) {}
        setTimeout(function () {
          if (laatikko.parentNode) laatikko.remove();
          // Vuoro seuraavalle ilmoitukselle
          tyonAlla();
        }, 700);
      });
    }
    return true;   // äänestys vie ilmoituspaikan juuri nyt
  }

  /* -------------------------------------------- 10b. ILMOITUS: TYÖN ALLA */
  /* Kertoo kävijälle että sivusto on kesken. Sulkeminen muistetaan istunnon
     ajan, jottei ilmoitus toistu joka sivunvaihdossa. */
  function tyonAlla() {
    var laatikko = $('[data-tyonalla]');
    if (!laatikko) return;

    // Vain yksi ilmoitus kerrallaan: äänestys on etusijalla. Tämä nousee
    // esiin vasta kun äänestyslaatikko on suljettu.
    if ($('[data-aanestys]')) return;

    var asetus = D.tyonAlla || {};
    if (!asetus.naytetaan) { laatikko.remove(); return; }

    var suljettu = false;
    try { suljettu = sessionStorage.getItem('liekki-tyonalla') === 'kiinni'; } catch (e) {}
    if (suljettu) { laatikko.remove(); return; }

    var teksti = $('[data-tyonalla-teksti]', laatikko);
    if (teksti) {
      var sisalto = asetus.teksti || 'Sivusto on työn alla.';
      var piste = sisalto.indexOf('.');
      if (piste > 0 && piste < sisalto.length - 1) {
        // Ensimmäinen virke lihavoituna, loppu tavallisena
        teksti.innerHTML = '';
        var vahva = document.createElement('strong');
        vahva.textContent = sisalto.slice(0, piste + 1);
        teksti.appendChild(vahva);
        teksti.appendChild(document.createTextNode(' ' + sisalto.slice(piste + 1).trim()));
      } else {
        teksti.textContent = sisalto;
      }
    }

    laatikko.hidden = false;
    setTimeout(function () { laatikko.classList.add('on-nakyvissa'); }, kevyt ? 0 : 1400);

    var nappi = $('[data-tyonalla-sulje]', laatikko);
    if (nappi) {
      nappi.addEventListener('click', function () {
        laatikko.classList.add('on-poistuu');
        try { sessionStorage.setItem('liekki-tyonalla', 'kiinni'); } catch (e) {}
        setTimeout(function () { if (laatikko.parentNode) laatikko.remove(); }, 700);
      });
    }
  }

  /* ------------------------------------------------ 10c. MENU-SIVUN OSIOT */
  /* Rakentaa ruokalistan content.js:n menu.osiot-listasta: välilehdet ylös,
     annokset ryhmiteltyinä alle. Tyhjä osio näyttää "tulossa" -tilan sen
     sijaan että jättäisi kohdan tyhjäksi. */
  function menuOsiot() {
    var kehys = $('[data-menu]');
    if (!kehys) return;

    var osiot = ((D.menu || {}).osiot || []).filter(function (o) { return o && o.nimi; });
    if (!osiot.length) { kehys.remove(); return; }

    var valilehdet = $('[data-menu-valilehdet]', kehys);
    var paneelit   = $('[data-menu-paneelit]', kehys);
    if (!valilehdet || !paneelit) return;

    valilehdet.innerHTML = '';
    paneelit.innerHTML = '';

    osiot.forEach(function (osio, i) {
      var avain = osio.avain || ('osio' + i);

      var nappi = document.createElement('button');
      nappi.type = 'button';
      nappi.className = 'menu-valilehti';
      nappi.id = 'valilehti-' + avain;
      nappi.setAttribute('role', 'tab');
      nappi.setAttribute('aria-controls', 'paneeli-' + avain);
      nappi.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      nappi.tabIndex = i === 0 ? 0 : -1;
      nappi.textContent = osio.nimi;
      valilehdet.appendChild(nappi);

      var paneeli = document.createElement('div');
      paneeli.className = 'menu-paneeli';
      paneeli.id = 'paneeli-' + avain;
      paneeli.setAttribute('role', 'tabpanel');
      paneeli.setAttribute('aria-labelledby', 'valilehti-' + avain);
      paneeli.hidden = i !== 0;
      paneeli.innerHTML = paneelinSisalto(osio);
      paneelit.appendChild(paneeli);
    });

    // Paneelit rakennettiin vasta nyt, joten puhelinlinkit kytketään tässä
    // (taytaTiedot on jo ehtinyt ajaa).
    $$('[data-href="puhelin"]', paneelit).forEach(function (a) {
      a.href = 'tel:' + (D.puhelinHref || '');
    });

    var napit = $$('.menu-valilehti', valilehdet);
    var levyt = $$('.menu-paneeli', paneelit);

    function valitse(i, siirraKohdistus) {
      napit.forEach(function (n, j) {
        n.setAttribute('aria-selected', j === i ? 'true' : 'false');
        n.tabIndex = j === i ? 0 : -1;
      });
      levyt.forEach(function (p, j) { p.hidden = j !== i; });
      if (siirraKohdistus) napit[i].focus();
      // Välilehti näkyviin, jos rivi on vieritettävä
      if (napit[i].scrollIntoView) {
        napit[i].scrollIntoView({ block: 'nearest', inline: 'center',
                                  behavior: kevyt ? 'auto' : 'smooth' });
      }
      var avain = osiot[i].avain;
      if (avain && history.replaceState) {
        history.replaceState(null, '', '#' + avain);
      }
    }

    napit.forEach(function (n, i) {
      n.addEventListener('click', function () { valitse(i); });
    });

    valilehdet.addEventListener('keydown', function (e) {
      var nyt = napit.indexOf(document.activeElement);
      if (nyt < 0) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); valitse((nyt + 1) % napit.length, true); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); valitse((nyt - 1 + napit.length) % napit.length, true); }
      if (e.key === 'Home')       { e.preventDefault(); valitse(0, true); }
      if (e.key === 'End')        { e.preventDefault(); valitse(napit.length - 1, true); }
    });

    // Häivytys oikeaan reunaan vain jos välilehtiä on rivin ulkopuolella
    function reunahaivy() {
      var jaljella = valilehdet.scrollWidth - valilehdet.clientWidth - valilehdet.scrollLeft;
      valilehdet.classList.toggle('on-lisaa', jaljella > 8);
    }
    valilehdet.addEventListener('scroll', reunahaivy, { passive: true });
    window.addEventListener('resize', reunahaivy, { passive: true });
    reunahaivy();
    setTimeout(reunahaivy, 900);

    // Suora linkki osioon: /menu/#brunssi
    var kohde = (location.hash || '').replace('#', '');
    if (kohde) {
      var loytyi = -1;
      osiot.forEach(function (o, i) { if (o.avain === kohde) loytyi = i; });
      if (loytyi > 0) valitse(loytyi);
    }
  }

  function paneelinSisalto(osio) {
    var annokset = (osio.annokset || []).filter(function (a) { return a && a.nimi; });
    var html = '';

    if (osio.kuvaus) {
      html += '<p class="menu-paneeli__kuvaus">' + turva(osio.kuvaus) + '</p>';
    }

    // Tapahtuman tiedot (päivä, kattaukset, hinta) omassa laatikossaan
    var tiedot = (osio.tiedot || []).filter(function (r) { return r && r.avain; });
    if (tiedot.length) {
      html += '<ul class="menu-tiedot">';
      tiedot.forEach(function (r) {
        html += '<li><span class="menu-tiedot__avain">' + turva(r.avain) + '</span>' +
                '<span class="menu-tiedot__arvo">' + turva(r.arvo || '') + '</span></li>';
      });
      html += '</ul>';
    }

    if (!annokset.length) {
      // Ei keksitä annoksia: näytetään rehellinen "tulossa" -tila.
      var osoite = osio.linkki ? (D.linkit || {})[osio.linkki] : '';
      html += '<div class="menu-tulossa">' +
        '<p class="menu-tulossa__otsikko">Lista päivittyy</p>' +
        '<p class="menu-tulossa__teksti">Tämän osion annokset ja hinnat lisätään sivulle ' +
        'lähiaikoina. Sillä välin kerromme mielellämme puhelimitse, mitä listalla on.</p>' +
        '<div class="napit">' +
        '<a class="nappi nappi--hiljainen" data-href="puhelin" href="#">' +
        '<span>Soita ja kysy</span></a>' +
        (osoite ? '<a class="nappi nappi--hiljainen" href="' + turva(osoite) +
                  '" target="_blank" rel="noopener"><span>Avaa nykyinen lista</span></a>' : '') +
        '</div></div>';
      return html;
    }

    // Ryhmitellään annokset otsikoiden alle. Sama ryhmänimi peräkkäin
    // = yksi otsikko; ryhmaLisa poimitaan ryhmän ensimmäiseltä riviltä.
    var edellinenRyhma = null;
    var hinnaton = false;   // buffet-ryhmä: yhdelläkään rivillä ei ole hintaa
    html += '<div class="menu-lista">';
    annokset.forEach(function (a, i) {
      var ryhma = a.ryhma || '';
      if (ryhma !== edellinenRyhma) {
        if (edellinenRyhma !== null) html += hinnaton ? '</ul></div>' : '</div>';
        var lisa = a.ryhmaLisa || '';
        hinnaton = true;
        for (var j = i; j < annokset.length && annokset[j].ryhma === ryhma; j++) {
          if (!lisa && annokset[j].ryhmaLisa) lisa = annokset[j].ryhmaLisa;
          if (annokset[j].hinta) hinnaton = false;
        }
        html += '<div class="menu-ryhma">' +
          '<h3 class="menu-ryhma__otsikko">' + turva(ryhma) +
          (lisa ? '<span class="menu-ryhma__lisa">' + turva(lisa) + '</span>' : '') +
          '</h3>';
        // Buffet-ryhmä listataan tiiviisti — hinnaton rivi ei tarvitse
        // pisteviivaa hintasarakkeeseen, jota ei ole.
        if (hinnaton) html += '<ul class="menu-buffet">';
        edellinenRyhma = ryhma;
      }

      if (hinnaton) {
        html += '<li><span class="menu-buffet__nimi">' + turva(a.nimi) +
          (a.merkit ? '<span class="menu-rivi__merkit">' + turva(a.merkit) + '</span>' : '') +
          '</span>' +
          (a.kuvaus ? '<span class="menu-buffet__kuvaus">' + turva(a.kuvaus) + '</span>' : '') +
          '</li>';
      } else {
        html += '<div class="menu-rivi">' +
          '<div class="menu-rivi__ylä">' +
          '<span class="menu-rivi__nimi">' + turva(a.nimi) +
          (a.merkit ? '<span class="menu-rivi__merkit">' + turva(a.merkit) + '</span>' : '') +
          '</span>' +
          '<span class="menu-rivi__pisteet" aria-hidden="true"></span>' +
          (a.hinta ? '<span class="menu-rivi__hinta">' + turva(a.hinta) +
            (a.hintaLisa ? '<span class="menu-rivi__hintalisa">' + turva(a.hintaLisa) + '</span>' : '') +
            '</span>' : '') +
          '</div>' +
          (a.kuvaus ? '<p class="menu-rivi__kuvaus">' + turva(a.kuvaus) + '</p>' : '') +
          '</div>';
      }
    });
    if (edellinenRyhma !== null) html += hinnaton ? '</ul></div>' : '</div>';
    html += '</div>';

    var huomiot = (osio.huomiot || []).filter(Boolean);
    // Osio voi määritellä oman merkkiselitteensä (esim. brunssissa on M)
    var selite = osio.merkkiselite || (D.menu || {}).merkkiselite || '';
    if (huomiot.length || selite) {
      html += '<div class="menu-huomiot">';
      huomiot.forEach(function (h) { html += '<p>' + turva(h) + '</p>'; });
      if (selite) html += '<p class="menu-selite">' + turva(selite) + '</p>';
      html += '</div>';
    }
    return html;
  }

  function turva(teksti) {
    return String(teksti)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ------------------------------------------------ 10c1. VIIKON LOUNAS */
  /* Koko viikon lounaslista Lounas-sivun alkuun. Kuluva arkipäivä
     korostuu, jotta kävijä näkee heti mitä tänään on tarjolla. */
  function viikonLounas() {
    var kehys = $('[data-lounaslista]');
    if (!kehys) return;

    var lista = D.lounaslista || {};
    var paivat = (lista.paivat || []).filter(function (p) {
      return p && (p.annokset || []).length;
    });

    if (!paivat.length) {
      kehys.innerHTML = '<div class="menu-tulossa">' +
        '<p class="menu-tulossa__otsikko">Lista päivittyy</p>' +
        '<p class="menu-tulossa__teksti">Tämän viikon lounaslista lisätään sivulle ' +
        'pian. Kerromme mielellämme puhelimitse, mitä tänään on tarjolla.</p>' +
        '<div class="napit"><a class="nappi nappi--hiljainen" href="tel:' +
        (D.puhelinHref || '') + '"><span>Soita ja kysy</span></a></div></div>';
      return;
    }

    var tanaan = ravintolanAika().paiva;

    var html = '';

    // Viikko, ajankohta ja mitä lounaaseen kuuluu
    var otsikko = [];
    if (lista.viikko) otsikko.push('Viikko ' + turva(lista.viikko));
    if (lista.ajalla) otsikko.push(turva(lista.ajalla));
    // Vain kevyt otsikko listan päälle — hinnat ja sisältö tulevat listan
    // jälkeen, jotta annokset näkyvät heti sivulle tultaessa.
    html += '<div class="lounasviikko__ylä">' +
      (otsikko.length ? '<p class="etiketti">' + otsikko.join(' · ') + '</p>' : '') +
      '<h2 class="otsikko-l" data-sanat>Viikon lounas</h2>' +
      '</div>';

    // Päiväkortit
    html += '<div class="lounaspaivat">';
    paivat.forEach(function (p, i) {
      var on = p.paiva === tanaan;
      html += '<article class="lounaspaiva' + (on ? ' on-tanaan' : '') +
        '" data-esiin style="--viive:' + Math.min(i, 4) + '">' +
        '<header class="lounaspaiva__ylä">' +
        '<h3 class="lounaspaiva__nimi">' + turva(p.nimi) + '</h3>' +
        (p.pvm ? '<span class="lounaspaiva__pvm">' + turva(p.pvm) + '</span>' : '') +
        (on ? '<span class="lounaspaiva__merkki">Tänään</span>' : '') +
        '</header><ul class="lounaspaiva__lista">' +
        p.annokset.map(function (a) {
          return '<li><span class="lounaspaiva__annos">' + turva(a.nimi) + '</span>' +
            (a.merkit ? '<span class="menu-rivi__merkit">' + turva(a.merkit) + '</span>' : '') +
            (a.lisa ? '<span class="lounaspaiva__lisa">' + turva(a.lisa) + '</span>' : '') +
            '</li>';
        }).join('') +
        '</ul></article>';
    });
    html += '</div>';

    // Mitä lounaaseen kuuluu ja mitä se maksaa — listan jälkeen
    var sisaltyy = (lista.sisaltyy || []).filter(Boolean);
    var hinnat = (lista.hinnat || []).filter(function (h) { return h && h.nimi; });
    if (sisaltyy.length || hinnat.length) {
      html += '<div class="lounasviikko__ala" data-esiin>';
      if (sisaltyy.length) {
        html += '<div class="lounas-sisaltyy">' +
          '<p class="lounas-sisaltyy__otsikko">Lounaaseen kuuluu</p>' +
          '<ul>' + sisaltyy.map(function (s) {
            return '<li>' + turva(s) + '</li>';
          }).join('') + '</ul></div>';
      }
      if (hinnat.length) {
        html += '<ul class="lounas-hinnat">' + hinnat.map(function (h) {
          return '<li><span class="lounas-hinnat__nimi">' + turva(h.nimi) + '</span>' +
                 '<span class="lounas-hinnat__hinta">' + turva(h.hinta || '') + '</span></li>';
        }).join('') + '</ul>';
      }
      html += '</div>';
    }

    // Merkkiselite ja muutosvarauma
    var alaosa = [];
    if (lista.merkkiselite) alaosa.push('<p class="menu-selite">' + turva(lista.merkkiselite) + '</p>');
    if (lista.huomio) alaosa.push('<p>' + turva(lista.huomio) + '</p>');
    if (alaosa.length) html += '<div class="menu-huomiot">' + alaosa.join('') + '</div>';

    kehys.innerHTML = html;

    // Puhelimessa kuluva päivä näkyviin ilman vierittämistä
    var korostettu = $('.lounaspaiva.on-tanaan', kehys);
    if (korostettu && window.matchMedia('(max-width: 899px)').matches) {
      var rata = $('.lounaspaivat', kehys);
      if (rata) rata.insertBefore(korostettu, rata.firstChild);
    }
  }

  /* --------------------------------------------------- 10c2. SAAVUTUKSET */
  /* Tarina-sivun tunnustukset content.js:n saavutukset-listasta,
     uusin vuosi ensin. Jos lista on tyhjä, koko osio jää pois. */
  function saavutukset() {
    var kehys = $('[data-saavutukset]');
    if (!kehys) return;

    var vuodet = (D.saavutukset || []).filter(function (v) {
      return v && v.vuosi && (v.tunnustukset || []).length;
    });
    if (!vuodet.length) {
      var osio = kehys.closest('section');
      if (osio) osio.remove(); else kehys.remove();
      return;
    }

    kehys.innerHTML = vuodet.map(function (v, i) {
      var rivit = v.tunnustukset.map(function (t) {
        return '<li>' + turva(t) + '</li>';
      }).join('');
      return '<div class="saavutus" data-esiin style="--viive:' + i + '">' +
        '<p class="saavutus__vuosi">' + turva(v.vuosi) + '</p>' +
        '<ul class="saavutus__lista">' + rivit + '</ul>' +
        '</div>';
    }).join('');
  }

  /* ---------------------------------------------- 10d. YHTEYSLOMAKKEEN AIHE */
  /* Yksi lomake, kaksi käyttötarkoitusta: palaute ja tarjouspyyntö. Aiheen
     valinta näyttää vain siihen kuuluvat kentät, jottei lomake näytä
     pitkältä kummassakaan tapauksessa. */
  function lomakeAihe() {
    var lomake = $('[data-aihevalinta]');
    if (!lomake) return;

    var napit = $$('[data-aihe-nappi]', lomake);
    var lohkot = $$('[data-aihe-lohko]', lomake);
    if (!napit.length) return;

    function valitse(arvo) {
      napit.forEach(function (n) {
        var on = n.getAttribute('data-aihe-nappi') === arvo;
        n.setAttribute('aria-pressed', on ? 'true' : 'false');
        n.classList.toggle('on-valittu', on);
      });
      lohkot.forEach(function (lohko) {
        var kenelle = (lohko.getAttribute('data-aihe-lohko') || '').split(' ');
        var nakyy = kenelle.indexOf(arvo) > -1;
        lohko.hidden = !nakyy;
        // Piilotettu kenttä ei saa estää lähetystä pakollisuudellaan
        $$('input, textarea, select', lohko).forEach(function (k) {
          if (k.hasAttribute('data-pakollinen')) k.required = nakyy;
          k.disabled = !nakyy;
        });
      });
      var otsikot = { palaute: 'Asiakaspalaute — bistroliekki.fi',
                      tarjous: 'Tarjouspyyntö — bistroliekki.fi' };
      lomake.setAttribute('data-aihe', otsikot[arvo] || 'Yhteydenotto — bistroliekki.fi');
      var kiitos = { palaute: 'Kiitos palautteestasi! Se menee suoraan ravintolan väelle.',
                     tarjous: 'Kiitos tarjouspyynnöstä! Olemme yhteydessä pian.' };
      lomake.setAttribute('data-kiitos', kiitos[arvo] || 'Kiitos viestistäsi!');
      var piilo = $('input[name="aihe"]', lomake);
      if (piilo) piilo.value = arvo === 'tarjous' ? 'Tarjouspyyntö' : 'Palaute';
      vastaanottaja();
    }

    /* Ruokaa ja keittiötä koskeva palaute menee keittiön omaan osoitteeseen,
       kaikki muu ravintolan yleiseen osoitteeseen. */
    var kohde = $('[data-palaute-kohde]', lomake);
    function vastaanottaja() {
      var palautteessa = $('[data-aihe-nappi="palaute"]', lomake)
        .getAttribute('aria-pressed') === 'true';
      var keittiolle = palautteessa && kohde && kohde.value === 'keittio';
      lomake.setAttribute('data-vastaanottaja',
        keittiolle ? (D.keittioSahkoposti || D.sahkoposti || '') : (D.sahkoposti || ''));
    }
    if (kohde) kohde.addEventListener('change', vastaanottaja);

    napit.forEach(function (n) {
      n.addEventListener('click', function () {
        valitse(n.getAttribute('data-aihe-nappi'));
      });
    });

    // Suora linkki: /yhteystiedot/#tarjouspyynto
    var alku = (location.hash || '').indexOf('tarjous') > -1 ? 'tarjous' : 'palaute';
    valitse(alku);
  }

  /* ------------------------------------------------- 11. AKTIIVINEN NAVI */
  function aktiivinenNavi() {
    var polku = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
    $$('.navi a, .mobiilivalikko a.mob-linkki').forEach(function (a) {
      var h = a.getAttribute('href');
      if (!h || h.charAt(0) === '#' || h.indexOf('http') === 0) return;
      var norm = new URL(h, location.href).pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
      if (norm === polku) a.setAttribute('aria-current', 'page');
    });
  }

  /* ------------------------------------------------------------ KÄYNNISTYS */
  function kaynnista() {
    headeri();
    taytaTiedot();
    aukiololista();
    aukiolotila();
    lounastila();
    ajankohtaista();
    galleria();
    tiktok();
    menuOsiot();
    viikonLounas();
    saavutukset();
    lomakeAihe();
    lomakkeet();
    aanestys();
    tyonAlla();
    aktiivinenNavi();
    jaaSanoiksi();
    esiin();
    kipinat();
    esirippu();
    vierityssilmukka();
    kursorihehku();
    laskurit();
    setInterval(function () { aukiolotila(); lounastila(); }, 60000);   // tila pysyy ajan tasalla
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', kaynnista);
  } else {
    kaynnista();
  }
})();
