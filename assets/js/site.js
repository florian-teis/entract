/* ============================================================
   Entr.act — comportements du site
   Aucune bibliothèque à installer : tout est ici.
   ============================================================ */

(function () {
  'use strict';

  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Prévient quand un élément entre dans l'écran et quand il en sort.
     On combine l'observateur du navigateur et une simple vérification au
     défilement : si l'un des deux ne répond pas, l'autre prend le relais. */
  function quandVisible(el, entre, sort) {
    var dedans = null;
    function bascule(vu) {
      if (vu === dedans) return;
      dedans = vu;
      if (vu) entre(); else if (sort) sort();
    }
    function verifie() {
      var r = el.getBoundingClientRect();
      var h = window.innerHeight || document.documentElement.clientHeight;
      bascule(r.bottom > -200 && r.top < h + 200);
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { bascule(e[0].isIntersecting); },
        { rootMargin: '200px' }).observe(el);
    }
    window.addEventListener('scroll', verifie, { passive: true });
    window.addEventListener('resize', verifie);
    verifie();
  }

  /* ==========================================================
     1. LES AVIS
     --------------------------------------------------------
     Avis Google réels, relevés sur la fiche du salon.
     Seuls les avis de 4 étoiles et plus figurent ici.

     Pour en ajouter un : copiez un bloc { ... }, collez-le
     dans la liste et remplacez le texte, le prénom et la date.
     Pour en retirer un : supprimez son bloc.
     ========================================================== */

  var AVIS = [
    {
      note: 5,
      texte: "Excellentes prestations dans ce salon du centre ville où l'accueil est chaleureux et le rapport qualité prix incomparable en centre ville, ce qui est réellement un plus pour des résultats meilleurs. Je conseille vraiment.",
      auteur: 'André M.',
      date: 'il y a 2 mois'
    },
    {
      note: 5,
      texte: "De passage, nous avons testé ce salon de coiffure que je vous recommande fortement. Super bien coiffés et en plus une équipe au top avec qui nous avons bien rigolé. Ne changez rien, vous êtes au top.",
      auteur: 'Dominique B.',
      date: 'il y a 11 mois'
    },
    {
      note: 5,
      texte: "Emmanuel et son équipe de coiffeuses ont créé une ambiance familiale qui rend ce salon agréable. La gentillesse et les attentions aux clients et clientes âgés font la différence.",
      auteur: 'Dominique L.',
      date: 'il y a un an'
    },
    {
      note: 5,
      texte: "Première fois que je viens dans ce salon. Super couleur ainsi que la coupe. Merci à l'équipe et à la coiffeuse qui m'a coiffée. Les prix sont corrects et les conseils bons. À bientôt.",
      auteur: 'Sylvie B.',
      date: 'il y a un an'
    },
    {
      note: 5,
      texte: "Facile d'avoir un rendez-vous. On est à l'écoute, on fait de superbes mèches et on prend le temps d'obtenir le résultat voulu. L'ambiance du salon est familiale, je recommande.",
      auteur: 'Léa P.',
      date: 'il y a un an'
    },
    {
      note: 5,
      texte: "Rendez-vous pour une permanente sur cheveux longs, je la recommande mille fois les yeux fermés. J'ai eu le résultat que je voulais : naturel mais bouclé.",
      auteur: 'Aya F.',
      date: 'il y a un an'
    },
    {
      note: 5,
      texte: "Je suis arrivée un peu déprimée par le temps et mes cheveux sans tenue. Je suis repartie rajeunie de 10 ans, avec une coupe restructurée et plein de conseils pertinents. Je recommande à 100 %.",
      auteur: 'Francine M.',
      date: 'il y a 4 ans'
    }
  ];

  /* ==========================================================
     2. LES HORAIRES
     --------------------------------------------------------
     Clé = jour (0 dimanche, 1 lundi ... 6 samedi).
     Valeur = [heure d'ouverture, heure de fermeture], ou null.
     Si les horaires changent, c'est ici, et dans le tableau
     du fichier index.html (section « Venir au salon »).
     ========================================================== */

  var HORAIRES = {
    0: null,
    1: [9, 18],
    2: [9, 19],
    3: [9, 19],
    4: [9, 19],
    5: [9, 19],
    6: [9, 18]
  };

  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  /* ==========================================================
     3. L'OUVERTURE
     --------------------------------------------------------
     Écran noir, le logo se lève lentement, puis il glisse
     jusqu'à sa place dans la page pendant que le noir
     s'efface. Une fois par visite. Ignorée si le visiteur a
     demandé moins d'animations.
     ========================================================== */

  function intro() {
    var voile = document.getElementById('intro');
    var hero = document.querySelector('.hero');
    if (!voile) return;

    var dejaVu = false;
    try { dejaVu = sessionStorage.getItem('entract-intro') === '1'; } catch (e) {}

    // pas d'ouverture : on retire le voile et la page s'affiche normalement
    if (reduit || dejaVu || !hero) {
      if (voile.parentNode) voile.parentNode.removeChild(voile);
      return;
    }

    var racine = document.documentElement;
    racine.classList.add('pose-intro');
    voile.classList.add('actif');
    hero.classList.add('hero--attente');

    var termine = false;
    function fermer() {
      if (termine) return;
      termine = true;
      racine.classList.remove('pose-intro');
      // le logo de la page reparaît à l'instant où le voile s'en va :
      // les deux sont superposés, la bascule ne se voit pas
      hero.classList.remove('hero--attente');
      if (voile.parentNode) voile.parentNode.removeChild(voile);
    }
    // filet de sécurité : la page se libère quoi qu'il arrive
    var secours = setTimeout(fermer, 4500);

    setTimeout(function () { voile.classList.add('entre'); }, 60);

    setTimeout(function () {
      // on mesure la place du logo dans la page et on y amène celui de
      // l'ouverture : les deux se superposent, la bascule ne se voit pas
      var depart = voile.querySelector('.intro__sigle');
      var arrivee = hero.querySelector('.hero__titre .sigle');
      if (depart && arrivee) {
        var a = depart.getBoundingClientRect();
        var b = arrivee.getBoundingClientRect();
        depart.style.transform =
          'translate(' + (b.left - a.left).toFixed(1) + 'px,' +
                         (b.top - a.top).toFixed(1) + 'px)';
      }
      voile.classList.add('sort');
      racine.classList.remove('pose-intro');

      try { sessionStorage.setItem('entract-intro', '1'); } catch (e) {}

      setTimeout(function () { clearTimeout(secours); fermer(); }, 950);
    }, 1500);
  }

  /* ==========================================================
     3 bis. LES BOUTONS DE RÉSERVATION
     --------------------------------------------------------
     On double le libellé et on glisse une pastille sous le
     texte. Tout est ajouté ici plutôt que dans index.html :
     le texte du bouton ne s'écrit qu'à un seul endroit, et
     sans JavaScript le bouton reste un bouton normal.
     ========================================================== */

  var FLECHE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false">' +
    '<path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function boutons() {
    var lot = document.querySelectorAll('.bouton--blanc');
    Array.prototype.forEach.call(lot, function (b) {
      if (b.querySelector('.bouton__libelle')) return;

      var texte = (b.textContent || '').trim();
      if (!texte) return;

      b.textContent = '';
      b.classList.add('bouton--vif');
      // nom annoncé une seule fois, quel que soit le lecteur d'écran
      if (!b.getAttribute('aria-label')) b.setAttribute('aria-label', texte);

      var bulle = document.createElement('span');
      bulle.className = 'bouton__bulle';
      bulle.setAttribute('aria-hidden', 'true');

      var libelle = document.createElement('span');
      libelle.className = 'bouton__libelle';
      libelle.textContent = texte;

      // doublure décorative : masquée aux lecteurs d'écran pour que le
      // libellé ne soit pas annoncé deux fois
      var survol = document.createElement('span');
      survol.className = 'bouton__survol';
      survol.setAttribute('aria-hidden', 'true');
      var mot = document.createElement('span');
      mot.textContent = texte;
      survol.appendChild(mot);
      survol.insertAdjacentHTML('beforeend', FLECHE);

      b.appendChild(bulle);
      b.appendChild(libelle);
      b.appendChild(survol);
    });
  }

  /* ==========================================================
     3 ter. COPIER UNE ADRESSE ÉLECTRONIQUE
     --------------------------------------------------------
     Un clic sur une adresse la copie dans le presse-papiers
     et le confirme, au lieu d'ouvrir un logiciel de courrier
     que beaucoup n'ont pas configuré.

     Le lien reste un vrai « mailto: » : sans JavaScript, ou
     par un clic droit, il se comporte comme avant.
     ========================================================== */

  function copier(texte) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texte);
    }
    // repli pour les navigateurs anciens et les pages ouvertes en local
    return new Promise(function (ok, non) {
      var zone = document.createElement('textarea');
      zone.value = texte;
      zone.setAttribute('readonly', '');
      zone.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(zone);
      zone.select();
      var reussi = false;
      try { reussi = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(zone);
      reussi ? ok() : non();
    });
  }

  function courriels() {
    var liens = document.querySelectorAll('a[href^="mailto:"]');
    if (!liens.length) return;

    // message annoncé aux lecteurs d'écran
    var annonce = document.createElement('p');
    annonce.className = 'sr';
    annonce.setAttribute('role', 'status');
    annonce.setAttribute('aria-live', 'polite');
    document.body.appendChild(annonce);

    Array.prototype.forEach.call(liens, function (a) {
      a.addEventListener('click', function (e) {
        // on laisse passer les clics du milieu et les clics modifiés,
        // qui servent à ouvrir autrement
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        var adresse = a.getAttribute('href').replace(/^mailto:/i, '').split('?')[0];
        e.preventDefault();

        copier(adresse).then(function () {
          a.classList.remove('copie-faite');
          void a.offsetWidth;              // relance l'animation si on reclique
          a.classList.add('copie-faite');
          annonce.textContent = 'Adresse copiée : ' + adresse;
          setTimeout(function () { a.classList.remove('copie-faite'); }, 2100);
        }).catch(function () {
          // si la copie est refusée, on ouvre le courrier comme avant
          window.location.href = a.href;
        });
      });
    });
  }

  /* ==========================================================
     4. L'ENTÊTE
     --------------------------------------------------------
     Fond noir dès qu'on quitte le haut de page, et bouton
     « Réserver » qui prend le relais quand celui du centre
     de l'écran n'est plus visible.
     ========================================================== */

  function entete() {
    var barre = document.getElementById('entete');
    var volet = document.getElementById('volet');
    if (!barre) return;

    var hero = document.querySelector('.hero');

    // Sur les pages sans vidéo d'accueil (les mentions légales), le bandeau
    // est là dès le départ : rien ne justifierait de le faire attendre.
    var toujours = !hero || barre.classList.contains('entete--fixe');

    var pose = function () {
      document.documentElement.classList.toggle('defile', window.scrollY > 40);
      if (toujours) { barre.classList.add('entete--visible'); return; }

      // Le bandeau descend seulement quand on a quitté la vidéo d'accueil,
      // et il remonte si l'on revient en haut.
      var quitte = hero.getBoundingClientRect().bottom < 120;
      barre.classList.toggle('entete--visible', quitte);
      if (!quitte) barre.classList.remove('entete--ouvert');
    };
    pose();
    window.addEventListener('scroll', pose, { passive: true });
    window.addEventListener('resize', pose);

    if (volet) {
      var basculer = function (ouvert) {
        barre.classList.toggle('entete--ouvert', ouvert);
        volet.setAttribute('aria-expanded', String(ouvert));
        volet.querySelector('.sr').textContent = ouvert ? 'Fermer le menu' : 'Ouvrir le menu';
      };
      volet.addEventListener('click', function () {
        basculer(volet.getAttribute('aria-expanded') !== 'true');
      });
      barre.querySelectorAll('.entete__nav a').forEach(function (lien) {
        lien.addEventListener('click', function () { basculer(false); });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') basculer(false);
      });
    }
  }

  /* ==========================================================
     5. OUVERT OU FERMÉ
     ========================================================== */

  function ouverture() {
    var cible = document.getElementById('etat-jour');
    var maintenant = new Date();
    var jour = maintenant.getDay();
    var heure = maintenant.getHours() + maintenant.getMinutes() / 60;
    var creneau = HORAIRES[jour];

    var ligne = document.querySelector('.horaires tr[data-jour="' + jour + '"]');
    if (ligne) ligne.setAttribute('data-aujourdhui', '');

    if (!cible) return;

    if (creneau && heure >= creneau[0] && heure < creneau[1]) {
      cible.textContent = 'Ouvert, jusqu’à ' + creneau[1] + 'h';
      cible.classList.add('etat--ouvert');
      return;
    }

    if (creneau && heure < creneau[0]) {
      cible.textContent = 'Ouvre aujourd’hui à ' + creneau[0] + 'h';
      return;
    }

    for (var i = 1; i <= 7; i++) {
      var suivant = HORAIRES[(jour + i) % 7];
      if (suivant) {
        var nom = i === 1 ? 'demain' : JOURS[(jour + i) % 7];
        cible.textContent = 'Fermé, ouvre ' + nom + ' à ' + suivant[0] + 'h';
        return;
      }
    }
  }

  /* ==========================================================
     6. LE RUBAN D'AVIS
     --------------------------------------------------------
     Défilement continu, sans à-coup, qui s'arrête au survol
     et quand un avis reçoit le focus au clavier.
     ========================================================== */

  function ruban() {
    var piste = document.getElementById('piste-avis');
    var cadre = document.getElementById('ruban-avis');
    if (!piste || !cadre || !AVIS.length) return;

    var bons = AVIS.filter(function (a) { return a.note >= 4; });
    if (!bons.length) return;

    var carte = function (avis) {
      var el = document.createElement('figure');
      el.className = 'avis-carte';
      el.tabIndex = 0;

      var etoiles = document.createElement('div');
      etoiles.className = 'avis-carte__notes';
      etoiles.setAttribute('aria-label', avis.note + ' étoiles sur 5');
      etoiles.textContent = new Array(avis.note + 1).join('★');

      var texte = document.createElement('blockquote');
      texte.className = 'avis-carte__texte';
      texte.textContent = '« ' + avis.texte + ' »';

      var source = document.createElement('span');
      source.className = 'avis-carte__source';
      source.textContent = 'Google';

      var qui = document.createElement('figcaption');
      qui.className = 'avis-carte__qui';
      qui.innerHTML = '<b></b><span></span>';
      qui.querySelector('b').textContent = avis.auteur;
      qui.querySelector('span').textContent = avis.date;

      el.appendChild(texte);
      el.appendChild(etoiles);
      el.appendChild(source);
      el.appendChild(qui);
      return el;
    };

    bons.forEach(function (a) { piste.appendChild(carte(a)); });

    if (reduit) {
      cadre.style.overflowX = 'auto';
      return;
    }

    // Duplication de la série pour que le raccord de boucle soit invisible.
    // Le pas de boucle vaut la largeur d'une série PLUS l'écart entre cartes,
    // sans quoi le ruban saute d'un cran à chaque tour.
    var ecart = parseFloat(getComputedStyle(piste).columnGap) || 0;
    var largeurSerie = piste.scrollWidth + ecart;

    bons.forEach(function (a) {
      var copie = carte(a);
      copie.setAttribute('aria-hidden', 'true');
      copie.tabIndex = -1;
      piste.appendChild(copie);
    });

    var x = 0;
    var vitesse = 32;          // pixels par seconde
    var dernier = null;
    var boucle = null;
    var survol = false;
    var aEcran = true;

    function pas(temps) {
      if (dernier === null) dernier = temps;
      var delta = Math.min((temps - dernier) / 1000, 0.05);
      dernier = temps;

      x -= vitesse * delta;
      if (largeurSerie > 0 && x <= -largeurSerie) x += largeurSerie;
      piste.style.transform = 'translateX(' + x.toFixed(2) + 'px)';

      boucle = requestAnimationFrame(pas);
    }

    // On n'anime que si le ruban est à l'écran et qu'on ne le survole pas :
    // hors de ces cas, aucune image n'est calculée.
    function lancer() {
      if (boucle === null && !survol && aEcran) { dernier = null; boucle = requestAnimationFrame(pas); }
    }
    function stopper() {
      if (boucle !== null) { cancelAnimationFrame(boucle); boucle = null; }
    }

    cadre.addEventListener('mouseenter', function () { survol = true; stopper(); });
    cadre.addEventListener('mouseleave', function () { survol = false; lancer(); });
    cadre.addEventListener('focusin', function () { survol = true; stopper(); });
    cadre.addEventListener('focusout', function () { survol = false; lancer(); });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopper(); else lancer();
    });

    aEcran = false;
    quandVisible(cadre,
      function () { aEcran = true; lancer(); },
      function () { aEcran = false; stopper(); });

    window.addEventListener('resize', function () {
      ecart = parseFloat(getComputedStyle(piste).columnGap) || 0;
      largeurSerie = (piste.scrollWidth + ecart) / 2;
    });
  }

  /* ==========================================================
     6 bis. LE FILM D'ACCUEIL
     --------------------------------------------------------
     Le navigateur choisit la source une fois pour toutes, au
     chargement. Quelqu'un qui ouvre le site dans une petite
     fenêtre puis l'agrandit garderait donc la version légère,
     qui paraît floue en grand. On vérifie et on corrige, au
     chargement comme au redimensionnement.
     ========================================================== */

  var FILM_LARGE = 'assets/video/hero.mp4';
  var FILM_ETROIT = 'assets/video/hero-mobile.mp4';

  function filmAccueil() {
    var v = document.querySelector('.hero__film video');
    if (!v) return;

    function ajuster() {
      var cible = window.innerWidth >= 700 ? FILM_LARGE : FILM_ETROIT;
      if (!v.currentSrc) return;                       // pas encore choisi
      if (v.currentSrc.indexOf(cible) !== -1) return;  // déjà le bon

      var instant = v.currentTime;
      while (v.firstChild) v.removeChild(v.firstChild);
      var s = document.createElement('source');
      s.src = cible;
      s.type = 'video/mp4';
      v.appendChild(s);
      v.load();
      v.addEventListener('loadedmetadata', function reprise() {
        v.removeEventListener('loadedmetadata', reprise);
        try { v.currentTime = instant % (v.duration || 1); } catch (e) {}
        v.play().catch(function () {});
      });
    }

    if (v.currentSrc) ajuster();
    else v.addEventListener('loadedmetadata', ajuster, { once: true });

    var minuteur;
    window.addEventListener('resize', function () {
      clearTimeout(minuteur);
      minuteur = setTimeout(ajuster, 350);
    });
  }

  /* ==========================================================
     6 ter. LES RÉVÉLATIONS AU DÉFILEMENT
     --------------------------------------------------------
     Même vocabulaire que le site Le Prénom : le texte monte
     en fondu quand il entre dans l'écran, les images se
     posent en se dézoomant, et la bande vidéo glisse
     doucement au passage.

     Pour animer un élément de plus, ajoutez son sélecteur à
     la liste ci-dessous. Rien à toucher dans index.html.
     ========================================================== */

  var A_REVELER = [
    '.recit__texte > *',
    '.recit__film',
    '.section__entree > *',
    '.programme__acte',
    '#prestations .mention',
    '.bande',
    '.membre',
    '#avis .ruban',
    '.venir__titre',
    '.venir__horaires',
    '.venir__plan',
    '.venir__contact',
    '.devanture',
    '.pied__marque',
    '.pied__legal'
  ];

  // ces éléments-là se dézooment au lieu de monter
  var A_ZOOMER = ['.devanture', '.portrait'];

  function auDefile(el, action) {
    var fait = false;
    function verifie() {
      if (fait) return;
      var r = el.getBoundingClientRect();
      var h = window.innerHeight || document.documentElement.clientHeight;
      // on déclenche quand l'élément a franchi le bas de l'écran de 60 px
      if (r.top < h - 60 && r.bottom > 0) { fait = true; action(); }
    }
    if ('IntersectionObserver' in window) {
      var oeil = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting && !fait) { fait = true; action(); oeil.disconnect(); }
      }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
      oeil.observe(el);
    }
    window.addEventListener('scroll', verifie, { passive: true });
    window.addEventListener('resize', verifie);
    window.addEventListener('load', verifie);
    verifie();
  }

  function revelations() {
    if (reduit) return;
    document.documentElement.classList.add('anime');

    var lot = [];
    A_REVELER.forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        if (lot.indexOf(el) === -1) { el.classList.add('revele'); lot.push(el); }
      });
    });
    A_ZOOMER.forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        el.classList.add('zoom');
        if (lot.indexOf(el) === -1) lot.push(el);
      });
    });

    // échelonnement : dans un même parent, chaque élément part un cran
    // après le précédent, ce qui donne une cascade au lieu d'un bloc
    lot.forEach(function (el) {
      var freres = Array.prototype.filter.call(el.parentNode.children, function (f) {
        return lot.indexOf(f) !== -1;
      });
      var rang = freres.indexOf(el);
      if (rang > 0) el.style.setProperty('--retard', Math.min(rang * 0.09, 0.45) + 's');
      auDefile(el, function () { el.classList.add('vu'); });
    });
  }

  /* ==========================================================
     6 quater. LA PARALLAXE DE LA BANDE
     --------------------------------------------------------
     Uniquement sur grand écran avec une souris : sur mobile,
     recalculer à chaque image saccade pour rien.
     ========================================================== */

  function parallaxe() {
    var fin = window.matchMedia('(min-width: 900px) and (pointer: fine)').matches;
    if (reduit || !fin) return;

    var film = document.querySelector('.bande video');
    if (!film) return;
    var cadre = film.parentNode;
    var enCours = false;

    function place() {
      var r = cadre.getBoundingClientRect();
      var h = window.innerHeight;
      if (r.bottom > -200 && r.top < h + 200) {
        var centre = r.top + r.height / 2;
        var avance = (centre - h / 2) / (h / 2 + r.height / 2);
        film.style.setProperty('--par', (-avance * 8) + '%');
      }
      enCours = false;
    }
    window.addEventListener('scroll', function () {
      if (!enCours) { window.requestAnimationFrame(place); enCours = true; }
    }, { passive: true });
    place();
  }

  /* ==========================================================
     7. LES VIDÉOS
     --------------------------------------------------------
     Elles ne se lancent que lorsqu'elles sont à l'écran :
     la page reste légère et la batterie tient.
     ========================================================== */

  function videos() {
    var lot = document.querySelectorAll('[data-video-vue]');
    Array.prototype.forEach.call(lot, function (v) {
      quandVisible(v,
        function () { v.play().catch(function () {}); },
        function () { v.pause(); });
    });
  }

  /* ==========================================================
     8. LE PLAN
     --------------------------------------------------------
     Carte MapLibre au style sombre, chargée seulement quand
     on arrive dessus. Si elle ne charge pas, l'adresse reste
     affichée à sa place.
     ========================================================== */

  var SALON = { lng: -1.7839664, lat: 46.4965027 };

  function plan() {
    var boite = document.getElementById('plan');
    if (!boite) return;

    var lance = false;
    var demarrer = function () {
      if (lance) return;
      lance = true;

      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.css';
      document.head.appendChild(css);

      var js = document.createElement('script');
      js.src = 'https://unpkg.com/maplibre-gl@5/dist/maplibre-gl.js';
      js.onload = dessiner;
      document.head.appendChild(js);
    };

    function dessiner() {
      if (!window.maplibregl) return;
      var carte = new window.maplibregl.Map({
        container: boite,
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [SALON.lng, SALON.lat],
        zoom: 16.1,
        attributionControl: { compact: true },
        cooperativeGestures: true
      });
      carte.addControl(new window.maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

      // Un simple repère, sans bulle : l'adresse est déjà écrite à côté.
      var puce = document.createElement('div');
      puce.className = 'repere';
      puce.setAttribute('title', 'Entr.act, 7 rue de l’Hôtel de Ville');

      new window.maplibregl.Marker({ element: puce })
        .setLngLat([SALON.lng, SALON.lat])
        .addTo(carte);

      // La mention CARTO / OpenStreetMap est obligatoire : c'est la licence des
      // données cartographiques. On la replie donc sur son seul bouton « i ».
      // Elle n'arrive qu'une fois les sources chargées, d'où cette vérification
      // répétée jusqu'à ce qu'elle ait du contenu.
      var replier = function () {
        var m = boite.querySelector('.maplibregl-ctrl-attrib');
        if (!m) return;
        m.classList.add('maplibregl-compact');
        if (!m.classList.contains('maplibregl-attrib-empty')) {
          m.classList.remove('maplibregl-compact-show');
          carte.off('idle', replier);
        }
      };
      carte.on('idle', replier);
    }

    quandVisible(boite, demarrer);
  }

  /* ==========================================================
     Mise en route
     ========================================================== */

  function demarrage() {
    boutons();
    courriels();
    intro();
    entete();
    ouverture();
    ruban();
    filmAccueil();
    videos();
    plan();
    revelations();
    parallaxe();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', demarrage);
  } else {
    demarrage();
  }
})();
