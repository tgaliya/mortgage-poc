import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowerService } from '../../core/services/borrower.service';
import { PropertyService } from '../../core/services/property.service';
import { LoanService } from '../../core/services/loan.service';
import { DocumentService } from '../../core/services/document.service';
import { LoanStatus } from '../../core/models/loan.model';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const LOAN_STATUS_COLORS: Record<LoanStatus, string> = {
  Active: '#2b4a7a',
  'Paid Off': '#22c55e',
  Delinquent: '#f59e0b',
  'In Default': '#f97316',
  Foreclosure: '#ef4444',
  Closed: '#94a3b8'
};

const LOAN_STATUSES: LoanStatus[] = ['Active', 'Paid Off', 'Delinquent', 'In Default', 'Foreclosure', 'Closed'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private borrowerService = inject(BorrowerService);
  private propertyService = inject(PropertyService);
  private loanService = inject(LoanService);
  private documentService = inject(DocumentService);

  borrowerCount = computed(() => this.borrowerService.borrowers().length);
  propertyCount = computed(() => this.propertyService.properties().length);
  loanCount = computed(() => this.loanService.loans().length);
  documentCount = computed(() => this.documentService.documents().length);

  /** Borrower records created per month, for the 6 months ending this month. */
  barChartData = computed(() => {
    const now = new Date();
    const months: { year: number; month: number; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth(), label: MONTH_LABELS[d.getMonth()] });
    }

    const counts = months.map(m => ({
      label: m.label,
      value: this.borrowerService.borrowers().filter(b => {
        const created = new Date(b.createdAt);
        return created.getFullYear() === m.year && created.getMonth() === m.month;
      }).length
    }));

    return counts;
  });

  maxBarValue = computed(() => Math.max(1, ...this.barChartData().map(d => d.value)));

  /** Active vs Inactive split across all borrowers. */
  donutSegments = computed(() => {
    const borrowers = this.borrowerService.borrowers();
    const total = borrowers.length;
    if (total === 0) {
      return [];
    }
    const active = borrowers.filter(b => b.borrowerStatus === 'Active').length;
    const inactive = total - active;

    return [
      { label: 'Active', value: Math.round((active / total) * 100), color: '#2b4a7a' },
      { label: 'Inactive', value: Math.round((inactive / total) * 100), color: '#cbd5e1' }
    ];
  });

  get donutGradient(): string {
    const segments = this.donutSegments();
    if (segments.length === 0) {
      return '#e2e8f0';
    }
    let cumulative = 0;
    const stops = segments.map(seg => {
      const start = cumulative;
      cumulative += seg.value;
      return `${seg.color} ${start}% ${cumulative}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  /** Loan count broken down by status, across all loans on record. */
  loanStatusBreakdown = computed(() => {
    const loans = this.loanService.loans();
    const total = loans.length;

    return LOAN_STATUSES.map(status => {
      const count = loans.filter(l => l.loanStatus === status).length;
      return {
        label: status,
        count,
        percent: total === 0 ? 0 : Math.round((count / total) * 100),
        color: LOAN_STATUS_COLORS[status]
      };
    });
  });

  maxLoanStatusCount = computed(() => Math.max(1, ...this.loanStatusBreakdown().map(s => s.count)));
}
