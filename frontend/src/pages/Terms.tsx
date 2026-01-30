import React from 'react'

const Terms = () => {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white" />
                <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-6 py-16 sm:px-8 lg:px-10">
                    {/* <span className="w-fit rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                        Legal
                    </span> */}
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                        Terms & Conditions
                    </h1>
                    <p className="max-w-3xl text-base leading-relaxed text-slate-700 sm:text-lg">
                        By accessing and using CompareAuto.in, you agree to comply with and be bound by the
                        following terms and conditions. If you do not agree, please refrain from using the
                        website.
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
                <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Use of website</h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                            CompareAuto.in provides automotive information, specifications, comparisons, and
                            related content for general informational purposes only. While efforts are made to
                            ensure accuracy, we do not guarantee the completeness or reliability of any
                            information presented.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Automotive information disclaimer</h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                            Vehicle prices, specifications, features, availability, and comparisons displayed on
                            CompareAuto.in are based on publicly available data and may vary by location,
                            variant, or time. Users should verify all details with official manufacturers,
                            dealers, or authorized sources before making purchase decisions.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Intellectual property</h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                            All content, including text, graphics, logos, and website design, is the property of
                            CompareAuto.in unless otherwise stated. Unauthorized reproduction, distribution, or
                            use of website content is strictly prohibited.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">External links</h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                            CompareAuto.in may contain links to third-party websites for reference or
                            convenience. We do not control or take responsibility for the content, accuracy, or
                            practices of these external sites.
                        </p>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Limitation of liability</h2>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                            CompareAuto.in shall not be held liable for any direct or indirect loss, damage, or
                            inconvenience arising from the use of the website or reliance on its content.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900">Modifications</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                            We reserve the right to update or modify these Terms & Conditions at any time
                            without prior notice. Continued use of the website after changes are made
                            constitutes acceptance of the updated terms.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900">Governing law</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-700">
                            These terms shall be governed by and interpreted in accordance with the laws of
                            India.
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-sm text-slate-900 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">Contact</h3>
                    <p className="mt-2 leading-relaxed text-slate-700">
                        For questions regarding these Terms & Conditions, please reach out using the Contact
                        page on CompareAuto.in.
                    </p>
                </div>
            </section>
        </div>
    )
}

export default Terms