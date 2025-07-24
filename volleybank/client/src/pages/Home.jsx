import { Link } from 'react-router-dom'
import { Trophy, Users, DollarSign, BarChart3, Shield, Smartphone } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Trophy,
      title: 'Match Management',
      description: 'Create and manage volleyball matches with team assignments and stake amounts.'
    },
    {
      icon: DollarSign,
      title: 'Stake Distribution',
      description: 'Automatically calculate and distribute earnings among winning team players.'
    },
    {
      icon: BarChart3,
      title: 'Player Statistics',
      description: 'Track individual performance with smashes, spikes, saves, and more.'
    },
    {
      icon: Users,
      title: 'Team Leaderboards',
      description: 'View rankings and compare team performance across all matches.'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'JWT authentication and PostgreSQL ensure your data is safe and accurate.'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Fully responsive design works perfectly on phones during matches.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-volleyball-orange via-volleyball-yellow to-volleyball-blue text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="mx-auto h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-8">
            <span className="text-4xl">🏐</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            VolleyBank
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            The complete volleyball match stake & performance tracking system for teams and players
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login" 
              className="bg-white text-volleyball-blue px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Get Started
            </Link>
            <button 
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-volleyball-blue transition-colors duration-200"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Volleyball Management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From match creation to earnings distribution, VolleyBank handles all aspects 
              of volleyball tournament management with precision and ease.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="stat-card text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">
            Built for Volleyball Communities
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="stat-card">
              <div className="text-4xl font-bold text-volleyball-orange mb-2">3</div>
              <div className="text-lg font-medium text-gray-900 mb-1">Teams Supported</div>
              <div className="text-gray-600">Perfect for tri-team tournaments</div>
            </div>
            
            <div className="stat-card">
              <div className="text-4xl font-bold text-volleyball-blue mb-2">100%</div>
              <div className="text-lg font-medium text-gray-900 mb-1">Accurate Stakes</div>
              <div className="text-gray-600">Precise financial calculations</div>
            </div>
            
            <div className="stat-card">
              <div className="text-4xl font-bold text-volleyball-green mb-2">Real-time</div>
              <div className="text-lg font-medium text-gray-900 mb-1">Live Updates</div>
              <div className="text-gray-600">Instant stat tracking during matches</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Elevate Your Volleyball Game?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join VolleyBank today and bring professional-level management to your volleyball community.
          </p>
          <Link 
            to="/login"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 inline-block"
          >
            Start Playing Now 🏐
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-volleyball-orange to-volleyball-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🏐</span>
            </div>
            <span className="font-bold text-xl">VolleyBank</span>
          </div>
          <p className="text-gray-400">
            Built with ❤️ for the volleyball community
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home 