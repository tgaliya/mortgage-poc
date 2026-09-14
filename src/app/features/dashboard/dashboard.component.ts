import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BorrowerService } from '../../core/services/borrower.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private borrowerService = inject(BorrowerService);

  borrowerCount = computed(() => this.borrowerService.borrowers().length);

  // Dummy counts (placeholder data since Property/Loan/Document modules are pending)
  propertyCount = 12;
  loanCount = 9;
  documentCount = 27;

  barChartData = [
    { label: 'Jan', value: 40 },
    { label: 'Feb', value: 65 },
    { label: 'Mar', value: 50 },
    { label: 'Apr', value: 80 },
    { label: 'May', value: 60 },
    { label: 'Jun', value: 95 }
  ];

  maxBarValue = Math.max(...this.barChartData.map(d => d.value));

  donutSegments = [
    { label: 'Active', value: 62, color: '#2b4a7a' },
    { label: 'Pending', value: 23, color: '#4f8ef7' },
    { label: 'Inactive', value: 15, color: '#cbd5e1' }
  ];

  get donutGradient(): string {
    let cumulative = 0;
    const stops = this.donutSegments.map(seg => {
      const start = cumulative;
      cumulative += seg.value;
      return `${seg.color} ${start}% ${cumulative}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }
}
