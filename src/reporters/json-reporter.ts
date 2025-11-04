import type {
  Reporter,
  FullConfig,
  FullResult,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

type SerializableError = {
  message?: string;
  value?: string;
  stack?: string;
};

type SerializableResult = {
  title: string;
  fullTitle: string;
  status: TestResult['status'];
  duration: number;
  retry: number;
  annotations: TestCase['annotations'];
  error?: SerializableError;
  attachments: { name: string; contentType: string }[];
};

type Report = {
  startedAt: string;
  finishedAt?: string;
  status?: FullResult['status'];
  totalTests?: number;
  passed?: number;
  failed?: number;
  skipped?: number;
  projects?: string[];
  results: SerializableResult[];
};

class JsonReporter implements Reporter {
  private report: Report = {
    startedAt: new Date().toISOString(),
    results: [],
  };

  private outputFile: string;
  private suite?: Suite;

  constructor(options: { outputFile?: string } = {}) {
    const outputPath = options.outputFile ?? path.join('reports', 'test-results.json');
    this.outputFile = path.isAbsolute(outputPath)
      ? outputPath
      : path.resolve(process.cwd(), outputPath);
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.suite = suite;
    this.report.projects = config.projects.map((project) => project.name);
    this.report.startedAt = new Date().toISOString();
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.report.results.push({
      title: test.title,
      fullTitle: test.titlePath().join(' › '),
      status: result.status,
      duration: result.duration,
      retry: result.retry,
      annotations: test.annotations,
      error: result.error
        ? {
            message: result.error.message,
            value: result.error.value,
            stack: result.error.stack,
          }
        : undefined,
      attachments: result.attachments.map((attachment) => ({
        name: attachment.name,
        contentType: attachment.contentType,
      })),
    });
  }

  async onEnd(result: FullResult) {
    const totalTests = this.suite?.allTests().length ?? 0;
    const passed = this.report.results.filter((r) => r.status === 'passed').length;
    const failed = this.report.results.filter((r) => r.status === 'failed').length;
    const skipped = this.report.results.filter((r) => r.status === 'skipped').length;

    this.report = {
      ...this.report,
      finishedAt: new Date().toISOString(),
      status: result.status,
      totalTests,
      passed,
      failed,
      skipped,
    };

    mkdirSync(path.dirname(this.outputFile), { recursive: true });
    writeFileSync(this.outputFile, JSON.stringify(this.report, null, 2), 'utf-8');
    console.log(`[json-reporter] Results written to ${this.outputFile}`);
  }
}

export default JsonReporter;
