/* Shared submit for the public website forms (home, about, early access, Raven demo).
   Posts to public.contacts with the publishable key already used by /early-access/.
   The key is meant to be public. No service-role key or other secret is used here.
   A filled honeypot field named "website" shows success and does not post. */
(function () {
  var SB_URL = 'https://xtjrnvdedaltwbbvqidr.supabase.co';
  var SB_KEY = 'sb_publishable_TN75vZ1OE1wcZ-d-PhpNBg_qHjCjVLC';
  var SUCCESS = "Thanks, you're on the list.";
  var ERROR = 'Something went wrong \u2014 please try again.';
  var MISSING = 'Please enter your name and email.';

  function field(form, name) {
    return form.querySelector('[name="' + name + '"]');
  }

  function statusNode(form) {
    if (form.querySelector('.form-status')) return form.querySelector('.form-status');
    return form.parentNode ? form.parentNode.querySelector('.form-status') : null;
  }

  function bind(form) {
    if (form.getAttribute('data-contact-bound') === '1') return;
    var source = form.getAttribute('data-contact-source');
    if (!source) return;
    form.setAttribute('data-contact-bound', '1');
    var status = statusNode(form);
    var button = form.querySelector('[type="submit"]');
    var sending = false;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;

      function say(text, kind) {
        if (!status) return;
        status.textContent = text;
        status.className = 'form-status show ' + (kind || '');
      }

      var nameEl = field(form, 'name');
      var emailEl = field(form, 'email');
      var webEl = field(form, 'website');
      var interestEl = field(form, 'interest');
      var name = nameEl ? nameEl.value.trim().slice(0, 120) : '';
      var email = emailEl ? emailEl.value.trim().slice(0, 254) : '';

      if (webEl && webEl.value) {
        say(SUCCESS, 'ok');
        form.reset();
        return;
      }
      if (!name || !email) {
        say(MISSING, 'err');
        return;
      }

      var body = { name: name, email: email, source: source };
      if (interestEl) body.interest = interestEl.value.trim() || null;

      sending = true;
      if (button) button.disabled = true;
      fetch(SB_URL + '/rest/v1/contacts', {
        method: 'POST',
        headers: {
          apikey: SB_KEY,
          Authorization: 'Bearer ' + SB_KEY,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(body)
      }).then(function (r) {
        sending = false;
        if (button) button.disabled = false;
        if (r.ok) {
          say(SUCCESS, 'ok');
          form.reset();
        } else {
          say(ERROR, 'err');
        }
      }).catch(function () {
        sending = false;
        if (button) button.disabled = false;
        say(ERROR, 'err');
      });
    });
  }

  function boot() {
    var forms = document.querySelectorAll('form[data-contact-source]');
    for (var i = 0; i < forms.length; i++) bind(forms[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
