import React from 'react'

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white" />
        <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-6 py-16 sm:px-8 lg:px-10">
          {/* <span className="w-fit rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            Legal
          </span> */}
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="max-w-4xl text-base leading-relaxed text-slate-700 sm:text-lg">
            At CompareAuto.in, we value your privacy and are committed to protecting the
            information of our users. This policy explains what we collect, why we collect it,
            and how we keep it safe when you use our website.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-600">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
              Last updated: January 30, 2026
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
              Effective immediately
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-16 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Information we collect</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                We only collect personally identifiable information when you voluntarily provide
                it through forms such as contact or inquiry submissions. This can include your
                name, email address, or other contact details.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                We may also automatically collect non-personal information such as browser type,
                device information, pages visited, and referring URLs to understand how users
                interact with our website and improve the experience.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">How we use information</h2>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                {[
                  'Improve website content and performance',
                  'Understand user behavior and preferences',
                  'Respond to user queries or feedback',
                  'Maintain security and prevent misuse',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                We do not sell, trade, or transfer personal information to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900">Cookies</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                CompareAuto.in uses cookies to enhance website functionality and user experience.
                Cookies help store visitor preferences and optimize content based on browser type
                or usage patterns.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                You can choose to disable cookies through your browser settings. Doing so may
                affect certain features of the website.
              </p>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Advertising & analytics</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                We may display advertisements served by Google AdSense or other third-party
                advertising partners. These advertisers may use cookies, including the
                DoubleClick cookie, to serve ads based on a user’s visit to this website and
                other websites.
              </p>
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition hover:text-blue-700"
              >
                Google Ads Settings
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Third-party policies</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Our Privacy Policy does not apply to other advertisers or websites. Please review
                the respective privacy policies of third-party ad servers or websites for details
                about their data practices.
              </p>
            </div>
          </aside>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Consent</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              By using CompareAuto.in, you consent to this Privacy Policy and agree to its terms.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Updates to this policy</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              This Privacy Policy may be updated periodically. Any changes will be posted on this
              page with a revised effective date.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-sm text-slate-900 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Contact</h3>
          <p className="mt-2 leading-relaxed text-slate-700">
            If you have questions about this Privacy Policy, please reach out using the Contact
            page on CompareAuto.in.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Privacy