import { ArrowRight, Heart, LockKeyhole, MessageCircle, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import romanticDate from '../assets/romantic-date.svg';

const journeys = [
  { number: '01', title: 'Tell your story', detail: 'Create a profile and share only the information you choose.' },
  { number: '02', title: 'Discover intentionally', detail: 'Explore profiles with relationship preferences in mind, not endless swiping.' },
  { number: '03', title: 'Connect by mutual interest', detail: 'Start a conversation when two people have chosen each other.' },
];

function Home() {
  return (
    <div className="min-h-screen bg-[#faf7f5] text-[#281e2a]">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3">
        Skip to content
      </a>
      <header className="relative z-10 border-b border-[#e8d9e0] bg-[#faf7f5]/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Link to="/" className="flex flex-col leading-tight text-[#512941]" aria-label="Porondam home">
            <span className="text-2xl font-semibold tracking-tight">porondam<span className="text-[#b64b71]">.</span></span>
            <span lang="si" className="text-xs tracking-wide">පොරොන්දම්</span>
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="#how-it-works" className="hover:text-[#a92f5b] focus-visible:underline">How it works</a>
            <a href="#about" className="hover:text-[#a92f5b] focus-visible:underline">Our approach</a>
            <a href="#privacy" className="hover:text-[#a92f5b] focus-visible:underline">Privacy & safety</a>
          </nav>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link to="/login" className="rounded-full px-3 py-2 text-[#512941] hover:bg-[#f0e4e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a92f5b]">Sign in</Link>
            <Link to="/register" className="rounded-full bg-[#512941] px-5 py-2.5 text-white transition hover:bg-[#703958] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#512941]">Create an account</Link>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-24">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e8cad6] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#843a5a]">
              <Heart className="h-3.5 w-3.5" aria-hidden="true" />
              Sri Lankan roots. Meaningful beginnings.
            </p>
            <h1 className="max-w-2xl font-serif text-[clamp(3rem,6.5vw,6.5rem)] leading-[1.02] tracking-[-0.045em] text-[#3b2034]">
              Something <em className="font-normal text-[#b64b71]">meaningful</em> starts here.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#584b55]">
              Porondam is being built for Sri Lankans at home and abroad who value real conversations, thoughtful introductions, and the freedom to move at their own pace.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/register" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#9f325d] px-6 py-3 font-semibold text-white transition hover:bg-[#7b2548] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9f325d]">
                Explore the prototype <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="#how-it-works" className="inline-flex min-h-12 items-center rounded-full border border-[#d7bbc6] px-6 py-3 font-semibold text-[#512941] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9f325d]">
                See how it works
              </a>
            </div>
            <p className="mt-5 max-w-lg text-xs leading-5 text-[#6f5d67]" role="note">
              Early-stage prototype. Not yet ready for real personal information. Age eligibility is self-declared, and safety features are still in development.
            </p>
          </div>
          <figure className="relative overflow-hidden rounded-[2.25rem] bg-[#e8d5df] shadow-[0_24px_70px_-35px_rgba(80,34,60,0.35)]">
            <img src={romanticDate} alt="Illustration of a romantic evening scene" className="aspect-[4/4.5] w-full object-cover" />
            <figcaption className="absolute bottom-4 left-4 right-4 rounded-xl bg-[#faf7f5]/95 px-5 py-4 text-sm text-[#512941] shadow-sm">
              Made for conversations that matter. <span className="block text-xs text-[#6e5b67]">Illustrative artwork, not a member profile.</span>
            </figcaption>
          </figure>
        </section>

        <section id="how-it-works" className="border-y border-[#e7d7df] bg-white/70 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-5 md:grid-cols-2 md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9f325d]">The experience</p>
                <h2 className="mt-4 max-w-md font-serif text-4xl leading-tight text-[#3b2034] sm:text-5xl">A little more intention. A lot less noise.</h2>
              </div>
              <p className="max-w-md text-base leading-7 text-[#655764]">Our goal is a clear, respectful path from your first introduction to a genuine connection.</p>
            </div>
            <ol className="mt-12 grid gap-8 border-t border-[#e7d7df] pt-8 md:grid-cols-3">
              {journeys.map((item) => (
                <li key={item.number} className="border-l-2 border-[#bb6786] pl-5">
                  <span className="font-serif text-3xl text-[#9f325d]">{item.number}</span>
                  <h3 className="mt-5 text-xl font-semibold text-[#3b2034]">{item.title}</h3>
                  <p className="mt-3 max-w-sm leading-7 text-[#655764]">{item.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="about" className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
          <div className="rounded-[2rem] bg-[#3b2034] p-9 text-white sm:p-12">
            <Users className="h-9 w-9 text-[#f2b4cb]" aria-hidden="true" />
            <p className="mt-9 text-sm font-semibold uppercase tracking-[0.18em] text-[#f2b4cb]">Built with Sri Lanka in mind</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">The culture you know. The connection you choose.</h2>
            <p className="mt-6 leading-8 text-[#eddfe8]">Optional district preferences are being introduced, with Sinhala, Tamil and English experiences on the roadmap. Your interests and intentions should always be yours to share.</p>
          </div>
          <div className="space-y-8 lg:px-6">
            <div className="flex items-start gap-4">
              <Heart className="mt-1 h-6 w-6 shrink-0 text-[#9f325d]" aria-hidden="true" />
              <div><h3 className="text-xl font-semibold">Mutual interest first</h3><p className="mt-2 leading-7 text-[#655764]">The prototype supports likes and mutual matches before messaging.</p></div>
            </div>
            <div className="flex items-start gap-4">
              <MessageCircle className="mt-1 h-6 w-6 shrink-0 text-[#9f325d]" aria-hidden="true" />
              <div><h3 className="text-xl font-semibold">Room for real conversation</h3><p className="mt-2 leading-7 text-[#655764]">A simple chat experience to help connections develop naturally.</p></div>
            </div>
            <div className="flex items-start gap-4">
              <LockKeyhole className="mt-1 h-6 w-6 shrink-0 text-[#9f325d]" aria-hidden="true" />
              <div><h3 className="text-xl font-semibold">Privacy as an ongoing commitment</h3><p className="mt-2 leading-7 text-[#655764]">We are reducing location precision and hardening account controls. Private photos, moderation and reporting are not yet complete.</p></div>
            </div>
          </div>
        </section>

        <section id="privacy" className="bg-[#f2e7eb] py-16">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#843a5a]"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Safety status</p>
              <h2 className="mt-3 font-serif text-3xl text-[#3b2034] sm:text-4xl">Trust is built, not claimed.</h2>
              <p className="mt-4 leading-7 text-[#655764]">Porondam is for adults aged 18 or over. Identity verification, anti-scam controls, blocking and reporting require further work before a public launch. Do not share sensitive details or payments in the prototype.</p>
            </div>
            <Link to="/register" className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#9f325d] px-6 py-3 font-semibold text-[#843a5a] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#843a5a]">
              View prototype <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-[#281e2a] text-[#e9dee5]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-end">
          <div><p className="text-2xl font-semibold text-white">porondam<span className="text-[#e59cb7]">.</span></p><p lang="si" className="mt-1 text-sm">පොරොන්දම්</p><p className="mt-3 text-sm">A Sri Lankan matchmaking experience in development.</p></div>
          <p className="text-xs text-[#cbbdc6]">© 2026 Porondam. Prototype — not production-ready.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
