const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Outer ring */}
          <div className="w-16 h-16 border-4 border-gray-700 rounded-full animate-spin">
            <div className="w-full h-full border-4 border-transparent border-t-cyber-500 rounded-full animate-spin"></div>
          </div>

          {/* Inner ring */}
          <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-cyber-400 rounded-full animate-spin animate-reverse"></div>

          {/* Center dot */}
          <div className="absolute top-6 left-6 w-4 h-4 bg-cyber-500 rounded-full animate-pulse"></div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-white">
            Loading Security Dashboard
          </h3>
          <p className="text-gray-400 mt-2">
            Initializing threat detection systems...
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex items-center justify-center space-x-2 mt-4">
          <div
            className="w-2 h-2 bg-cyber-500 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-cyber-500 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-cyber-500 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
