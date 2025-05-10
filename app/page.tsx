import Layout from './components/layout/Layout'
import  EventsPage  from '@/app/components/events/EventContainer'
import { TrendingUp } from 'lucide-react'
import { VortexHero } from './components/extra/VortexHero'

export default function Home() {
  return (

    <Layout>
      <div className="max-w-7xl mx-auto dotted-border-horizontal border-b  overflow-hidden">
        <VortexHero/>
      </div>

      {//Minor Hero Section 
}
      <div className="max-w-7xl mx-auto py-8 px-8 dotted-border-vertical border-x  overflow-hidden">
        <div className="flex flex-col md:flex-row items-center">
          <div className="mb-0 flex flex-col gap-1">
              <a className="group mb-2 inline-flex items-center gap-2 px-0.5 text-sm font-medium" href="/product-hunt">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="underline-offset-4 group-hover:underline">Get Started with Product Hunt</span>
              </a>
            <div>
                <h1 className="text-4xl md:text-1xl font-bold mb-1">
                  Nation Wide Events All In One Place
                </h1>
                <h1 className="mb-4 text-white/90">
                  Dynamic portal to campus happenings, where news, events, and opportunities.
                </h1>
                            <a href="https://discord.gg/cQ5gxusATk" target="_blank" rel="noopener noreferrer">
<button className="relative inline-flex h-10 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2 focus:ring-offset-green-100">
  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#d1fae5_0%,#047857_50%,#d1fae5_100%)]" />
  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-green-700 px-4  text-sm font-medium text-white backdrop-blur-3xl hover:bg-green-800">
    Join Discord
  </span>
</button>
</a>
              </div>

          </div>
        </div>
      </div>


      <EventsPage/>
    </Layout>
  )
}