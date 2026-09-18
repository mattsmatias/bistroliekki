/* ==========================================================================
   BISTRO LIEKKI — ETUSIVUN KOEVERSION EFEKTIT  (/testi.html)
   --------------------------------------------------------------------------
   Kaikki tämän sivun omat liikkeet ja sisällöt. Ei kirjastoja.

   Periaatteet:
   - Jokainen efekti kytkeytyy pois, jos käyttäjä on valinnut käyttö-
     järjestelmästä "vähennä liikettä". Silloin sivu näyttää samalta,
     se vain ei liiku.
   - Piirto tapahtuu vain kun kohde on ruudulla. Ruudun ulkopuolella
     oleva kangas ei kuluta akkua.
   - Kaikki teksti ja luvut tulevat window.LIEKKI:stä eli samasta
     lähteestä kuin muukin sivusto. Mitään ei kirjoiteta tänne käsin.
   ========================================================================== */
(function () {
  'use strict';

  var HILJAA = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, k) { return (k || document).querySelector(s); }
  function $$(s, k) { return Array.prototype.slice.call((k || document).querySelectorAll(s)); }
  function turva(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var NUOLI = '<svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">' +
    '<path d="M9 1l4 4-4 4M13 5H0" stroke="currentColor" stroke-width="1.4" ' +
    'stroke-linecap="square"/></svg>';
  function TAHTI(koko) {
    return '<svg viewBox="0 0 24 24" fill="none" width="' + koko + '" height="' + koko +
      '" aria-hidden="true"><path d="M12 2.5l2.6 5.6 6 .8-4.4 4.2 1.1 6.1L12 16.3 6.7 ' +
      '19.2l1.1-6.1L3.4 8.9l6-.8z" stroke="currentColor" stroke-width="1.4" ' +
      'stroke-linejoin="round"/></svg>';
  }

  /* ======================================================================
     1. HIILLOS — heron kipinäkangas
     ----------------------------------------------------------------------
     Alalaidassa hehkuva hiilipeti, josta nousee kipinöitä. Kipinä
     syntyy alhaalta, nousee, heiluu sivusuunnassa ja sammuu. Piirto
     additiivisella sekoituksella, jolloin päällekkäiset kipinät
     kirkastuvat kuten oikeassa tulessa.
     ====================================================================== */
  function hiillos(kangas) {
    if (HILJAA) return;
    var ctx = kangas.getContext('2d', { alpha: true });
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var L = 0, K = 0, hiukkaset = [], id = null, nakyy = true, t = 0;

    /* Kipinöiden määrä suhteutetaan pinta-alaan, jottei puhelin piirrä
       yhtä montaa kuin iso näyttö. */
    function maara() { return Math.max(26, Math.min(90, Math.round(L * K / 26000))); }

    function mitat() {
      L = kangas.clientWidth; K = kangas.clientHeight;
      kangas.width = Math.round(L * dpr);
      kangas.height = Math.round(K * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      while (hiukkaset.length > maara()) hiukkaset.pop();
      while (hiukkaset.length < maara()) hiukkaset.push(uusi(true));
    }

    function uusi(hajalleen) {
      return {
        x: Math.random() * L,
        y: hajalleen ? Math.random() * K : K + 8 + Math.random() * 30,
        r: 0.5 + Math.random() * 1.9,
        nopeus: 0.18 + Math.random() * 0.75,
        heilu: Math.random() * Math.PI * 2,
        heiluNopeus: 0.006 + Math.random() * 0.016,
        heiluLaajuus: 6 + Math.random() * 20,
        ika: hajalleen ? Math.random() * 400 : 0,
        kesto: 320 + Math.random() * 520,
        lampo: Math.random()            // 0 = syvä oranssi, 1 = kellertävä
      };
    }

    function piirra() {
      ctx.clearRect(0, 0, L, K);

      /* Hiilipeti: kolme laajaa hehkua alalaidassa, jotka sykkivät
         hitaasti eri tahtiin. Tämä on se "lämpö", joka näkyy silloinkin
         kun yksittäiset kipinät jäävät huomaamatta. */
      ctx.globalCompositeOperation = 'lighter';
      for (var h = 0; h < 3; h++) {
        var hx = L * (0.22 + h * 0.28);
        var syke = 0.55 + 0.45 * Math.sin(t * 0.012 + h * 2.1);
        var sade = Math.max(140, L * 0.24) * (0.9 + 0.1 * syke);
        var g = ctx.createRadialGradient(hx, K + 30, 0, hx, K + 30, sade);
        g.addColorStop(0, 'rgba(226,184,96,' + (0.15 * syke).toFixed(3) + ')');
        g.addColorStop(0.45, 'rgba(176,132,42,' + (0.07 * syke).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(176,132,42,0)');
        ctx.fillStyle = g;
        ctx.fillRect(hx - sade, K - sade, sade * 2, sade * 2 + 40);
      }

      for (var i = 0; i < hiukkaset.length; i++) {
        var p = hiukkaset[i];
        p.ika++;
        p.y -= p.nopeus;
        p.heilu += p.heiluNopeus;
        var x = p.x + Math.sin(p.heilu) * p.heiluLaajuus;

        /* Kipinä kirkastuu nopeasti ja sammuu hitaasti. */
        var osuus = p.ika / p.kesto;
        var kirkkaus = osuus < 0.12 ? osuus / 0.12 : Math.max(0, 1 - (osuus - 0.12) / 0.88);
        kirkkaus *= kirkkaus;

        if (osuus >= 1 || p.y < -20) { hiukkaset[i] = uusi(false); continue; }

        var sade2 = p.r * 5;
        var hehku = ctx.createRadialGradient(x, p.y, 0, x, p.y, sade2);
        /* Savyt seuraavat sivun messinkia: kirkkain kipina on lahes
           valkoinen, keskimmainen kullanruskea, himmein syva messinki. */
        var vari = p.lampo > 0.72 ? '255,235,185' : (p.lampo > 0.34 ? '236,196,110' : '176,132,42');
        hehku.addColorStop(0, 'rgba(' + vari + ',' + (0.95 * kirkkaus).toFixed(3) + ')');
        hehku.addColorStop(0.35, 'rgba(' + vari + ',' + (0.35 * kirkkaus).toFixed(3) + ')');
        hehku.addColorStop(1, 'rgba(176,132,42,0)');
        ctx.fillStyle = hehku;
        ctx.beginPath();
        ctx.arc(x, p.y, sade2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      t++;
      id = requestAnimationFrame(piirra);
    }

    function kaynnista() { if (!id && nakyy) { id = requestAnimationFrame(piirra); } }
    function pysayta() { if (id) { cancelAnimationFrame(id); id = null; } }

    mitat();
    window.addEventListener('resize', function () { mitat(); }, { passive: true });

    if (window.IntersectionObserver) {
      new IntersectionObserver(function (rivit) {
        nakyy = rivit[0].isIntersecting;
        if (nakyy) kaynnista(); else pysayta();
      }, { threshold: 0 }).observe(kangas);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pysayta(); else kaynnista();
    });
    kaynnista();
  }

  /* ======================================================================
     2. SYTTYVÄ OTSIKKO
     ----------------------------------------------------------------------
     Otsikko pilkotaan kirjaimiksi. Kirjain syttyy hehkuvan oranssina ja
     jäähtyy luunvalkoiseksi — sama kuin hiili, joka leimahtaa ja
     tummuu. Sanat pysyvät kokonaisina, jottei ruudunlukija lue
     kirjaimia yksitellen: alkuperäinen teksti jää aria-labeliin.
     ====================================================================== */
  function sytyta(el) {
    if (!el || el.dataset.sytytetty) return;
    var teksti = el.textContent.trim();
    el.setAttribute('aria-label', teksti);
    el.dataset.sytytetty = '1';

    var n = 0;
    el.innerHTML = Array.prototype.map.call(el.children.length ? el.children : [el],
      function () { return ''; }).join('') || '';

    el.innerHTML = teksti.split('\n').join(' ').split(' ').map(function (sana) {
      return '<span class="t-sana" aria-hidden="true">' +
        sana.split('').map(function (kirjain) {
          return '<span class="t-kirjain" style="--i:' + (n++) + '">' +
            turva(kirjain) + '</span>';
        }).join('') + '</span>';
    }).join(' ');

    if (HILJAA) { el.classList.add('on-syttynyt'); return; }
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { el.classList.add('on-syttyy'); });
    });
  }

  /* Sivun sisällä olevat otsikot syttyvät vasta kun ne tulevat ruudulle. */
  function sytytyksetNakyviin() {
    var kohteet = $$('[data-t-syty]');
    if (!kohteet.length) return;
    if (!window.IntersectionObserver) { kohteet.forEach(sytyta); return; }
    var tarkkailija = new IntersectionObserver(function (rivit) {
      rivit.forEach(function (r) {
        if (!r.isIntersecting) return;
        sytyta(r.target);
        tarkkailija.unobserve(r.target);
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });
    kohteet.forEach(function (el) { tarkkailija.observe(el); });
  }

  /* ======================================================================
     3. ESIINTULO — porrastettu paljastus
     ----------------------------------------------------------------------
     Lohko nousee ja kirkastuu. Lapsielementeille annetaan viive, jolloin
     rivit tulevat perätysten eivätkä yhtenä möykkynä.
     ====================================================================== */
  function esiintulo() {
    var kohteet = $$('[data-t-esiin]');
    if (!kohteet.length) return;
    if (HILJAA || !window.IntersectionObserver) {
      kohteet.forEach(function (el) { el.classList.add('on-esiin'); });
      return;
    }
    var tarkkailija = new IntersectionObserver(function (rivit) {
      rivit.forEach(function (r) {
        if (!r.isIntersecting) return;
        r.target.classList.add('on-esiin');
        tarkkailija.unobserve(r.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    kohteet.forEach(function (el) { tarkkailija.observe(el); });
  }

  /* ======================================================================
     4. VIERITYSMOOTTORI
     ----------------------------------------------------------------------
     Yksi rAF-silmukka hoitaa kaiken vieritykseen sidotun liikkeen:
     heron parallaksin, vaakagallerian ja lukujen laskurit. Erillisten
     scroll-kuuntelijoiden sijaan yksi silmukka pitää liikkeen tasaisena.
     ====================================================================== */
  function vieritysmoottori() {
    var heroKuva = $('[data-t-parallaksi]');
    var heroSisus = $('[data-t-hero-sisus]');
    var rata = $('[data-t-rata]');
    var ratakehys = rata && rata.closest('[data-t-ratakehys]');
    var kaynnissa = false;

    function paivita() {
      kaynnissa = false;
      var kork = window.innerHeight;

      /* Hero: kuva liikkuu hitaammin kuin sivu, sisältö nousee ja
         haalistuu. Tämä antaa syvyyttä ilman erillistä kirjastoa. */
      if (heroKuva) {
        var y = window.scrollY || window.pageYOffset;
        if (y < kork * 1.2) {
          heroKuva.style.transform = 'translate3d(0,' + (y * 0.28).toFixed(1) + 'px,0) scale(' +
            (1.06 + y / kork * 0.06).toFixed(4) + ')';
          if (heroSisus) {
            var s = Math.min(1, y / (kork * 0.75));
            heroSisus.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
            heroSisus.style.opacity = (1 - s * 0.85).toFixed(3);
          }
        }
      }

      /* Vaakagalleria: kuvat liukuvat sivusuunnassa sen mukaan, miten
         pitkällä osion läpi ollaan. Kehys on tahmea, joten kuvat
         liikkuvat paikallaan pysyvän ruudun poikki. */
      if (rata && ratakehys && window.innerWidth >= 1000) {
        var laat = ratakehys.getBoundingClientRect();
        var matka = rata.scrollWidth - window.innerWidth + 48;
        if (matka > 0) {
          var eteneminen = Math.min(1, Math.max(0, -laat.top / (laat.height - kork)));
          rata.style.transform = 'translate3d(' + (-matka * eteneminen).toFixed(1) + 'px,0,0)';
        }
      }
    }

    function pyyda() { if (!kaynnissa) { kaynnissa = true; requestAnimationFrame(paivita); } }

    if (HILJAA) {
      if (rata) rata.style.transform = 'none';
      return;
    }
    window.addEventListener('scroll', pyyda, { passive: true });
    window.addEventListener('resize', pyyda, { passive: true });
    paivita();
  }

  /* ======================================================================
     5. LUKULASKURI
     ----------------------------------------------------------------------
     Luku pyörähtää kohdalleen kun se tulee ruudulle. Vain numerot
     animoidaan; teksti jää sellaisekseen.
     ====================================================================== */
  function laskurit() {
    var kohteet = $$('[data-t-luku]');
    if (!kohteet.length) return;

    function aja(el) {
      var loppu = parseFloat(el.getAttribute('data-t-luku'));
      if (!isFinite(loppu)) return;
      if (HILJAA) { el.textContent = String(loppu); return; }
      var alku = Math.max(0, loppu - Math.min(loppu, 60));
      var kesto = 1100, t0 = null;
      function askel(aika) {
        if (t0 === null) t0 = aika;
        var p = Math.min(1, (aika - t0) / kesto);
        var helpotus = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(alku + (loppu - alku) * helpotus));
        if (p < 1) requestAnimationFrame(askel);
      }
      requestAnimationFrame(askel);
    }

    if (!window.IntersectionObserver) { kohteet.forEach(aja); return; }
    var tarkkailija = new IntersectionObserver(function (rivit) {
      rivit.forEach(function (r) {
        if (!r.isIntersecting) return;
        aja(r.target);
        tarkkailija.unobserve(r.target);
      });
    }, { threshold: 0.6 });
    kohteet.forEach(function (el) { tarkkailija.observe(el); });
  }

  /* ======================================================================
     6. HEHKUVA KURSORI NAPEISSA
     ----------------------------------------------------------------------
     Painikkeen sisällä oleva hehku seuraa osoitinta. Pelkkää CSS-
     muuttujan päivitystä, ei uudelleenladontaa.
     ====================================================================== */
  function nappihehku() {
    if (HILJAA) return;
    if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;
    $$('.t-hehkunappi').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--hx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--hy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* ======================================================================
     7. SISÄLTÖ — tunnustukset, päivän lounas ja menu-nostot
     ----------------------------------------------------------------------
     Kaikki luetaan window.LIEKKI:stä. Jos jokin puuttuu, osio poistuu
     sivulta kokonaan eikä jää tyhjäksi laatikoksi.
     ====================================================================== */
  function tunnustukset(D) {
    var osio = $('[data-t-tunnustukset]');
    var rivi = $('[data-t-tunnustukset-rivi]');
    if (!osio || !rivi) return;

    var kohteet = [];
    (D.saavutukset || []).forEach(function (v) {
      if (!v || !v.vuosi) return;
      (v.tunnustukset || []).forEach(function (t) { if (t) kohteet.push({ vuosi: v.vuosi, teksti: t }); });
    });
    if (!kohteet.length) { osio.remove(); return; }

    rivi.innerHTML = kohteet.slice(0, 4).map(function (k, i) {
      return '<div class="t-tunnus" style="--i:' + i + '">' +
        '<p class="t-tunnus__vuosi">' +
          '<span class="t-tunnus__merkki" aria-hidden="true">' + TAHTI(18) + '</span>' +
          turva(k.vuosi) + '</p>' +
        '<p class="t-tunnus__teksti">' + turva(k.teksti) + '</p>' +
        '</div>';
    }).join('');
    osio.hidden = false;
  }

  /* ------------------------------------------------- HERON TODISTE ---- */
  /* Yksi tunnustus heti otsikon alle. Uusin vuosi ensin, siita
     ensimmainen tunnustus. Jos tunnustuksia ei ole, rivi jaa pois. */
  function heronTodiste(D) {
    var el = $('[data-t-todiste]');
    if (!el) return;
    /* Kaikki tunnustukset yhdeksi listaksi ja jarjestykseen. Saanto on
       selitettavissa: voitto ennen sijoitusta, uudempi ennen vanhempaa.
       Mitaan ei muotoilla uudelleen — teksti on sellaisenaan. */
    var kaikki = [];
    (D.saavutukset || []).forEach(function (v) {
      if (!v || !v.vuosi) return;
      (v.tunnustukset || []).forEach(function (t) {
        if (!t) return;
        kaikki.push({
          teksti: t,
          vuosi: v.vuosi,
          sijoitus: /sijalla\s*\d+/i.test(t) ? 1 : 0,   // "sijalla 19" on heikompi
          numero: /\d+\.\s*paras/i.test(t) ? 1 : 0     // "4. paras" heikompi kuin "paras"
        });
      });
    });
    if (!kaikki.length) { el.remove(); return; }
    kaikki.sort(function (a, b) {
      return a.sijoitus - b.sijoitus || a.numero - b.numero ||
             (parseInt(b.vuosi, 10) || 0) - (parseInt(a.vuosi, 10) || 0);
    });
    var v = kaikki[0];
    el.innerHTML = TAHTI(15) +
      '<span>' + turva(v.teksti) + '</span>' +
      '<b>' + turva(v.vuosi) + '</b>';
    el.hidden = false;
  }

  /* ---------------------------------------------------- TARJONTA ------ */
  /* Kolme korttia: kaksi a la carte -ryhmaa ja lounas. Kuvat ovat talon
     omia valokuvia ja kuvateksti kertoo vain sen, mita kuvassa oikeasti
     nakyy — kuvaa ei liiteta yksittaiseen annokseen. Annosnimet ja
     hinnat luetaan ruokalistalta sellaisenaan. */
  var TARJONTA = [
    {
      ryhma: 'Smash burgerit',
      otsikko: 'Smash burgerit',
      kuva: 'assets/img/burgeri-chimichurri.webp',
      pieni: 'assets/img/burgeri-chimichurri-sm.webp',
      alt: 'Tuplaburgeri puuhiiligrillistä, cheddaria ja punaista kastiketta, vieressä ranskalaiset',
      teksti: 'Briossisämpylä, rotukarjan smash-pihvit ja talon majoneesi. ' +
              'Ranskalaiset ja aiolidippi kuuluvat hintaan.',
      linkki: 'menu/', linkkiTeksti: 'Kaikki burgerit'
    },
    {
      ryhma: 'Puuhiiligrillistä',
      otsikko: 'Puuhiiligrillistä',
      kuva: 'assets/img/grill-flame.webp',
      pieni: 'assets/img/grill-flame-sm.webp',
      alt: 'Liekit nousevat puuhiilestä',
      teksti: 'Pihvit paistetaan hiilloksen päällä. Kastikkeet, maustevoit ' +
              'ja lisukkeet valitaan erikseen.',
      linkki: 'menu/', linkkiTeksti: 'Koko grillilista',
      /* Tama ei ole valokuva annoksesta vaan talon liekkitekstuuri, joten
         se saa oman rajauksensa ja kirkkautensa. */
      tekstuuri: true
    }
  ];

  function ensiHinta(teksti) {
    var m = String(teksti || '').replace(/\s/g, '').match(/(\d+)[,.](\d+)/);
    return m ? parseFloat(m[1] + '.' + m[2]) : null;
  }
  function euro(n) { return n.toFixed(2).replace('.', ',') + ' €'; }

  function tarjonta(D) {
    var kehys = $('[data-t-tarjonta]');
    if (!kehys) return;

    var alacarte = ((D.menu || {}).osiot || []).filter(function (o) {
      return o && o.avain === 'alacarte';
    })[0];
    var kortit = [];

    TARJONTA.forEach(function (k, i) {
      var annokset = alacarte ? (alacarte.annokset || []).filter(function (a) {
        return a && a.ryhma === k.ryhma && a.nimi;
      }) : [];
      if (!annokset.length) return;

      var hinnat = annokset.map(function (a) { return ensiHinta(a.hinta); })
                           .filter(function (n) { return n !== null; });
      var alkaen = hinnat.length ? Math.min.apply(null, hinnat) : null;
      var ylin = hinnat.length ? Math.max.apply(null, hinnat) : null;
      var tasahinta = alkaen !== null && alkaen === ylin;

      /* Naytettavat annokset hintajarjestykseen, jotta kortin "alkaen"
         ja ensimmainen rivi kertovat saman hinnan. */
      annokset = annokset.slice().sort(function (x, y) {
        return (ensiHinta(x.hinta) || 0) - (ensiHinta(y.hinta) || 0);
      });

      kortit.push(
        '<article class="t-tarjous' + (k.tekstuuri ? ' t-tarjous--tekstuuri' : '') +
        '" data-t-esiin style="--i:' + i + '">' +
        '<div class="t-tarjous__kuva"><picture>' +
          '<source media="(max-width: 700px)" srcset="' + turva(k.pieni) + '">' +
          '<img src="' + turva(k.kuva) + '" alt="' + turva(k.alt) + '" ' +
          'loading="lazy" decoding="async"></picture></div>' +
        '<div class="t-tarjous__sisus">' +
          '<div class="t-tarjous__yla">' +
            '<h3 class="t-tarjous__otsikko">' + turva(k.otsikko) + '</h3>' +
            (alkaen === null ? '' :
              '<p class="t-tarjous__hinta">' +
              (tasahinta ? '' : '<span>alkaen</span>') + euro(alkaen) + '</p>') +
          '</div>' +
          '<p class="t-tarjous__teksti">' + turva(k.teksti) + '</p>' +
          '<ul class="t-tarjous__lista">' + annokset.slice(0, 3).map(function (a) {
            var nimi = String(a.nimi).split(' — ')[0];
            return '<li><span>' + turva(nimi) + '</span>' +
              (a.hinta ? '<b>' + turva(a.hinta) + '</b>' : '') + '</li>';
          }).join('') + '</ul>' +
          '<a class="linkki t-tarjous__linkki" href="' + turva(k.linkki) + '">' +
            turva(k.linkkiTeksti) + NUOLI + '</a>' +
        '</div></article>');
    });

    /* Kolmas kortti: lounas. Hinta, kellonajat ja paivat tulevat
       content.js:n lounas-lohkosta, lounastunnustus saavutuksista. */
    var L = D.lounas || {};
    var lounasTunnustus = null;
    (D.saavutukset || []).forEach(function (v) {
      if (lounasTunnustus || !v || !v.vuosi) return;
      (v.tunnustukset || []).forEach(function (t) {
        if (!lounasTunnustus && /lounas/i.test(t)) {
          lounasTunnustus = { teksti: t, vuosi: v.vuosi };
        }
      });
    });

    if (L.hinta || L.auki) {
      kortit.push(
        '<article class="t-tarjous t-tarjous--lounas" data-t-esiin style="--i:2">' +
        '<div class="t-tarjous__kuva"><picture>' +
          '<source media="(max-width: 700px)" srcset="assets/img/lounasbuffet-sm.webp">' +
          '<img src="assets/img/lounasbuffet.webp" ' +
          'alt="Bistro Liekin lounasbuffet katettuna ravintolasalissa Talvikkitiellä" ' +
          'loading="lazy" decoding="async"></picture></div>' +
        '<div class="t-tarjous__sisus">' +
          '<div class="t-tarjous__yla">' +
            '<h3 class="t-tarjous__otsikko">Lounasbuffet</h3>' +
            (L.hinta ? '<p class="t-tarjous__hinta">' + turva(L.hinta) + '</p>' : '') +
          '</div>' +
          '<p class="t-tarjous__teksti">Katettu pöytä joka arkipäivä: salaatit, ' +
          'lämpimät ruoat ja leivät samalla hinnalla.</p>' +
          '<ul class="t-tarjous__lista">' +
            (L.paivatTeksti ? '<li><span>Päivät</span><b>' + turva(L.paivatTeksti) + '</b></li>' : '') +
            (L.auki && L.kiinni ? '<li><span>Kello</span><b>' + turva(L.auki) + '–' +
              turva(L.kiinni) + '</b></li>' : '') +
            (L.hintaLisatieto ? '<li><span>Myös</span><b>' + turva(L.hintaLisatieto) + '</b></li>' : '') +
          '</ul>' +
          (lounasTunnustus ?
            '<p class="t-tarjous__tunnustus">' + TAHTI(14) +
            turva(lounasTunnustus.teksti) + ' · ' + turva(lounasTunnustus.vuosi) + '</p>' : '') +
          '<a class="linkki t-tarjous__linkki" href="lounas/">Viikon lounaslista' + NUOLI + '</a>' +
        '</div></article>');
    }

    if (!kortit.length) { var s = kehys.closest('section'); if (s) s.remove(); return; }
    kehys.innerHTML = kortit.join('');
  }

  /* ------------------------------------- KORTIN KUVA SEURAA OSOITINTA -- */
  /* Kuva siirtyy muutaman pikselin osoittimen suuntaan. Liike on
     tarkoituksella pieni: tavoite on eloisuus, ei huojunta. */
  function kuvasiirto() {
    if (HILJAA) return;
    if (!window.matchMedia || !window.matchMedia('(hover: hover)').matches) return;
    $$('.t-tarjous').forEach(function (kortti) {
      if (kortti.dataset.siirto) return;
      kortti.dataset.siirto = '1';
      kortti.addEventListener('pointermove', function (e) {
        var r = kortti.getBoundingClientRect();
        kortti.style.setProperty('--sx',
          (((e.clientX - r.left) / r.width - 0.5) * 14).toFixed(1) + 'px');
        kortti.style.setProperty('--sy',
          (((e.clientY - r.top) / r.height - 0.5) * 10).toFixed(1) + 'px');
      });
      kortti.addEventListener('pointerleave', function () {
        kortti.style.setProperty('--sx', '0px');
        kortti.style.setProperty('--sy', '0px');
      });
    });
  }

  function viikonNumero(d) {
    var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var pv = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - pv);
    var alku = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil((((t - alku) / 86400000) + 1) / 7);
  }
  function helsinki() {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Helsinki' }));
  }

  function lounasTanaan(D) {
    var sisus = $('[data-t-lounas-sisus]');
    if (!sisus) return;
    var pvmEl = $('[data-t-lounas-pvm]');

    var lista = D.lounaslista || {};
    var nyt = helsinki();
    var paiva = nyt.getDay();
    var samaViikko = String(lista.viikko || '') === String(viikonNumero(nyt));

    var tanaan = null;
    (lista.paivat || []).forEach(function (p) {
      if (p && p.paiva === paiva && (p.annokset || []).length) tanaan = p;
    });

    var lounasPaivat = (D.lounas && D.lounas.paivat) || [];
    if (lounasPaivat.indexOf(paiva) === -1) {
      if (pvmEl) pvmEl.textContent = '';
      sisus.innerHTML = '<p class="leipa" style="margin:0">Lounasta tarjoillaan ' +
        turva(((D.lounas && D.lounas.paivatTeksti) || 'arkisin').toLowerCase()) +
        '. Tänään keittiö tekee à la carte -listaa.</p>';
      return;
    }

    /* Vanhan viikon listaa ei näytetä. Väärä tieto on pahempi kuin
       puuttuva tieto — varsinkin ruokavaliomerkinnöissä. */
    if (!samaViikko || !tanaan) {
      if (pvmEl) pvmEl.textContent = '';
      sisus.innerHTML = '<p class="leipa" style="margin:0">Tämän viikon lista ' +
        'päivittyy Lounas-sivulle. Kerromme mielellämme puhelimitse, mitä ' +
        'tänään on tarjolla.</p>';
      return;
    }

    if (pvmEl) pvmEl.textContent = (tanaan.nimi || '') + (tanaan.pvm ? ' ' + tanaan.pvm : '');
    sisus.innerHTML = '<ul class="t-annokset">' + tanaan.annokset.map(function (a, i) {
      return '<li style="--i:' + Math.min(i, 12) + '"><span>' + turva(a.nimi) + '</span>' +
        (a.merkit ? '<span class="t-merkit">' + turva(a.merkit) + '</span>' : '') +
        '</li>';
    }).join('') + '</ul>';
  }

  /* Vaakagallerian kuvat content.js:n galleria-listasta. */
  function vaakagalleria(D) {
    var rata = $('[data-t-rata]');
    if (!rata) return;
    var kuvat = (D.galleria || []).filter(function (k) { return k && k.kuva; });
    if (!kuvat.length) {
      var s = rata.closest('section');
      if (s) s.remove();
      return;
    }
    rata.innerHTML = kuvat.map(function (k, i) {
      return '<figure class="t-laatta" style="--i:' + i + '">' +
        '<img src="' + turva(k.kuva) + '" alt="' + turva(k.alt || '') + '" ' +
        'loading="lazy" decoding="async">' +
        '</figure>';
    }).join('');
  }

  /* ====================================================================== */
  function aja() {
    var D = window.LIEKKI || {};
    tunnustukset(D);
    heronTodiste(D);
    lounasTanaan(D);
    tarjonta(D);
    vaakagalleria(D);
    // Uusi sisältö pitää vielä kytkeä paljastukseen ja laskureihin.
    esiintulo();
    kuvasiirto();
    laskurit();
    sytytyksetNakyviin();
  }

  function alusta() {
    var kangas = $('[data-t-hiillos]');
    if (kangas) hiillos(kangas);
    sytyta($('[data-t-syty-heti]'));
    esiintulo();
    sytytyksetNakyviin();
    vieritysmoottori();
    laskurit();
    nappihehku();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', alusta);
  } else { alusta(); }

  /* site.js sulauttaa tietokannan sisällön ja ilmoittaa siitä. */
  document.addEventListener('liekki:valmis', aja);
  setTimeout(function () { if (!$('.t-tarjous')) aja(); }, 2500);
}());
