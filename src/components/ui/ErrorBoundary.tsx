"use client";

import { Component, type ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";

interface Props {
  children: ReactNode;
  section: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    Sentry.captureException(error, {
      extra: { section: this.props.section },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="font-medium text-red-800 dark:text-red-400">
            Something went wrong in {this.props.section}
          </p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-500">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
