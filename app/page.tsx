import Layout from './components/layout/Layout'

export default function Home() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-16 px-6">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Nation Wide Events <br />
              <span className="text-white">All In One Place</span>
            </h1>
              <a href="https://discord.gg/cQ5gxusATk" target="_blank" rel="noopener noreferrer">
                <button className="bg-green-700 text-white font-medium py-2 px-6 rounded-md transition hover:cursor-pointer">
                  Join Discord
                </button>
              </a>
          </div>
          <div className="md:w-1/2">
            <div className="bg-gray-700 h-64 md:h-96 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Event Image</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}