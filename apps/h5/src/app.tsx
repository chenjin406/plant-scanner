import { Component, PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './app.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Don't retry failed requests in development
      refetchOnWindowFocus: false,
      staleTime: 30000,
      // Suppress error logs in development when API is not ready
      useErrorBoundary: false,
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    // Suppress React Query errors in development
    error: process.env.NODE_ENV === 'development' ? () => {} : console.error,
  },
});

class App extends Component<PropsWithChildren> {
  componentDidMount() {}

  componentDidShow() {}

  componentDidHide() {}

  render() {
    return (
      <QueryClientProvider client={queryClient}>
        {this.props.children}
      </QueryClientProvider>
    );
  }
}

export default App;
