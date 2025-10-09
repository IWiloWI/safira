const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = function override(config, env) {
  // Production build optimizations
  if (env === 'production') {
    // Enable source map analysis (optional, can be disabled in final production)
    config.devtool = 'source-map';

    // Optimize bundle splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Separate vendor code
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          // Separate React and related libraries
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            name: 'react-vendor',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Separate large UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](framer-motion|styled-components|react-icons)[\\/]/,
            name: 'ui-vendor',
            priority: 15,
            reuseExistingChunk: true,
          },
          // Common code used across multiple chunks
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
      // Minimize runtime chunk
      runtimeChunk: 'single',
      // Use better minification
      minimize: true,
    };

    // Add bundle analyzer (only when ANALYZE env variable is set)
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: 'bundle-report.html',
          openAnalyzer: false,
          generateStatsFile: true,
          statsFilename: 'bundle-stats.json',
        })
      );
    }
  }

  return config;
};
