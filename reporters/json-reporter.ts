import type {
  FullConfig,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

type JsonReporterOptions = {
  outputFile?: string;
};

type SerializableError = {
  message?: string;
  stack?: string;
};

type SerializableAttachment = {
  name: string;
  contentType: string;
  path?: string;
};

type SerializableResult = {
  title: string;
  path: string[];
  status: TestResult['status'];
  duration: number;
  errors: SerializableError[];
  attachments: SerializableAttachment[];
};

type JsonReport = {
  config: {
    project: string;
    retries: number;
  }[];
  summary: {
    startedAt: string;
    finishedAt: string;
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    interrupted: number;
    timedOut: number;
  };
  tests: SerializableResult[];
};

class JsonReporter implements Reporter {
  private readonly options: JsonReporterOptions;
  private startedAt = new Date();
  private readonly results: SerializableResult[] = [];

  constructor(options: JsonReporterOptions = {}) {
    this.options = options;
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.startedAt = new Date();
    this.projectMeta = config.projects.map((project) => ({
      project: project.name,
      retries: project.retries,
    }));
    this.totalTests = suite.allTests().length;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.results.push({
      title: test.title,
      path: test.titlePath(),
      status: result.status,
      duration: result.duration,
      errors: this.serializeErrors(result),
      attachments: this.serializeAttachments(result),
    });
  }

  async onEnd() {
    const finishedAt = new Date();
    const summary = this.buildSummary();

    const report: JsonReport = {
      config: this.projectMeta,
      summary: {
        ...summary,
        startedAt: this.startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
      },
      tests: this.results,
    };

    const outputFile = this.options.outputFile;
    if (!outputFile) {
      return;
    }

    mkdirSync(dirname(outputFile), { recursive: true });
    writeFileSync(outputFile, JSON.stringify(report, null, 2), 'utf-8');
  }

  // Internal accounting
  private projectMeta: JsonReport['config'] = [];
  private totalTests = 0;

  private buildSummary() {
    const summary = {
      total: this.totalTests,
      passed: 0,
      failed: 0,
      skipped: 0,
      interrupted: 0,
      timedOut: 0,
    };

    for (const result of this.results) {
      switch (result.status) {
        case 'passed':
          summary.passed += 1;
          break;
        case 'failed':
          summary.failed += 1;
          break;
        case 'skipped':
          summary.skipped += 1;
          break;
        case 'interrupted':
          summary.interrupted += 1;
          break;
        case 'timedOut':
          summary.timedOut += 1;
          break;
        default:
          break;
      }
    }

    return summary;
  }

  private serializeErrors(result: TestResult): SerializableError[] {
    if (!result.errors || result.errors.length === 0) {
      return [];
    }

    return result.errors.map((error) => ({
      message: error.message,
      stack: error.stack,
    }));
  }

  private serializeAttachments(result: TestResult): SerializableAttachment[] {
    if (!result.attachments || result.attachments.length === 0) {
      return [];
    }

    return result.attachments.map((attachment) => ({
      name: attachment.name,
      contentType: attachment.contentType,
      path: attachment.path,
    }));
  }
}

export default JsonReporter;
