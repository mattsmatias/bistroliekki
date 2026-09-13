/* ==========================================================================
   BISTRO LIEKKI — yhteysasetukset
   --------------------------------------------------------------------------
   Tämän tiedoston kautta sekä sivusto että hallintapaneeli löytävät
   tietokannan. Arvot löytyvät Supabasen projektista kohdasta
   Project Settings -> API Keys.

   osoite  Project URL
   avain   Julkinen avain. Tämä on tarkoitettu näkymään sivun lähdekoodissa:
           sillä voi vain LUKEA sisältöä. Muokkaaminen vaatii kirjautumisen,
           ja sen estää tietokannan oma rivitason suojaus.

   Jos osoite jätetään tyhjäksi, sivusto toimii täsmälleen kuten ennenkin ja
   näyttää content.js:n sisällön. Mikään ei siis hajoa, vaikka tietokanta
   olisi hetken poissa käytöstä.
   ========================================================================== */

window.LIEKKI_YHTEYS = {
  osoite: 'https://qllayfnruadzfshnjnek.supabase.co',
  avain: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsbGF5Zm5ydWFkemZzaG5qbmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNjAwNjEsImV4cCI6MjEwNDgzNjA2MX0.IeyJFJbNDyEBS-hbKLTFyqYRuCU43i66rbmhvoSF89A'
};
