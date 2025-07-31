const features = [
  {
    title: "AI-Powered Predictions",
    description:
      "Advanced machine learning algorithms analyze team form, injuries, head-to-head records, and 50+ statistical factors",
    icon: "🤖",
  },
  {
    title: "85% Accuracy Rate",
    description:
      "Our models have consistently delivered 85%+ accuracy across major leagues with transparent performance tracking",
    icon: "🎯",
  },
  {
    title: "Live Match Analysis",
    description:
      "Real-time updates and live match statistics to help you make informed decisions as games unfold",
    icon: "📊",
  },
  {
    title: "15+ Major Leagues",
    description:
      "Complete coverage of Premier League, La Liga, Serie A, Bundesliga, Champions League, and more",
    icon: "🏆",
  },
  {
    title: "Expert Insights",
    description:
      "Detailed match analysis, team news, injury reports, and tactical breakdowns from our football experts",
    icon: "⚽",
  },
  {
    title: "Mobile Optimized",
    description:
      "Get predictions on-the-go with our responsive design and push notifications for important matches",
    icon: "📱",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            Why Football Fans Choose Our Predictions
          </h2>
          <p className="mb-16 text-lg text-gray-600">
            Join thousands of successful punters who trust our data-driven
            approach to football predictions and analysis
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-xl border border-gray-200 bg-white p-8 text-center transition-all hover:border-blue-500 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="mb-4 text-5xl group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call-to-action section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Winning?</h3>
            <p className="text-lg mb-6 text-blue-100">
              Join our community of smart football fans and get access to
              today&apos;s best predictions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                🚀 Get Free Predictions
              </button>
              <button className="border-2 border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                📈 View Success Stories
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
