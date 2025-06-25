import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DashboardsService } from '../../services/dashboards.service';
import { CommonModule } from '@angular/common';
import { SubscriptionDashboardDto } from '../../models/SubscriptionDashboardDto';
import { PipesModule } from '../../pipes/pipes.module';

declare var google: any;

@Component({
  selector: 'app-charts-subscriptions',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PipesModule],
  templateUrl: './charts-subscriptions.component.html',
  styleUrl: './charts-subscriptions.component.css'
})
export class ChartsSubscriptionsComponent implements OnInit {

  filterForm: FormGroup;
  dashboardData: SubscriptionDashboardDto | null = null;
  loading = false;

  private activeSubscriptionsChart: any;
  private monthlySubscriptionsChart: any;

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardsService
  ) {
    this.filterForm = this.fb.group({
      from: [''],
      to: ['']
    });
  }

  ngOnInit(): void {
    google.charts.load('current', { packages: ['corechart', 'line'] });
    google.charts.setOnLoadCallback(() => {
      this.loadDashboardData();
    });
  }

  getDiscountPercentage(): number {
    if (!this.dashboardData || this.dashboardData.totalSubscriptions === 0) return 0;
    return Math.round((this.dashboardData.withDiscount / this.dashboardData.totalSubscriptions) * 100);
  }

  loadDashboardData(): void {
    this.loading = true;
    const filters = this.filterForm.value;
    
    this.dashboardService.getSubscriptionDashboard(filters.from, filters.to)
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.loading = false;
          setTimeout(() => {
            this.drawCharts();
          }, 200);
        },
        error: (error) => {
          console.error('Error loading subscription dashboard data:', error);
          this.loading = false;
        }
      });
  }

  onFilterChange(): void {
    this.loadDashboardData();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.loadDashboardData();
  }

  private drawCharts(): void {
    if (!this.dashboardData) return;

    const activeElement = document.getElementById('activeSubscriptionsChart');
    const monthlyElement = document.getElementById('monthlyChart');

    console.log('Active element:', activeElement);
    console.log('Monthly element:', monthlyElement);
    console.log('Dashboard data:', this.dashboardData);

    if (activeElement) {
      this.drawActiveSubscriptionsChart();
    } else {
      console.error('Elemento activeSubscriptionsChart no encontrado');
    }

    if (monthlyElement && this.dashboardData.subscriptionsByMonth?.length > 0) {
      this.drawMonthlySubscriptionsChart();
    } else {
      console.error('Elemento monthlyChart no encontrado o sin datos:', {
        element: monthlyElement,
        hasData: this.dashboardData.subscriptionsByMonth?.length > 0
      });
    }
  }

  private drawActiveSubscriptionsChart(): void {
    if (!this.dashboardData) return;

    const data = google.visualization.arrayToDataTable([
      ['Estado', 'Cantidad'],
      ['Suscripciones Activas', this.dashboardData.activeSubscriptions],
      ['Suscripciones Inactivas', this.dashboardData.inactiveSubscriptions]
    ]);

    const options = {
      titleTextStyle: {
        fontSize: 16,
        bold: true
      },
      pieHole: 0.3,
      colors: ['#28a745', '#dc3545'],
      legend: {
        position: 'bottom',
        alignment: 'center'
      },
      chartArea: {
        left: 20,
        top: 50,
        width: '90%',
        height: '70%'
      }
    };

    this.activeSubscriptionsChart = new google.visualization.PieChart(
      document.getElementById('activeSubscriptionsChart')
    );
    this.activeSubscriptionsChart.draw(data, options);
  }

private drawMonthlySubscriptionsChart(): void {
  if (!this.dashboardData?.subscriptionsByMonth?.length) {
    console.error('No hay datos mensuales para mostrar');
    return;
  }

  console.log('Dibujando gráfico mensual con datos:', this.dashboardData.subscriptionsByMonth);

  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Mes');
  data.addColumn('number', 'Suscripciones');

  this.dashboardData.subscriptionsByMonth.forEach(monthly => {
    data.addRow([monthly.month, monthly.count]);
    console.log(`Agregando fila: ${monthly.month}, ${monthly.count}`);
  });

  const options = {
    titleTextStyle: {
      fontSize: 16,
      bold: true
    },
    legend: { position: 'bottom' },
    areaOpacity: 0.2, 
    colors: ['#0d6efd'], 
    hAxis: {
      title: 'Mes',
      titleTextStyle: {
        fontSize: 14,
        bold: true
      },
      textStyle: {
        fontSize: 12
      }
    },
    vAxis: {
      title: 'Cantidad de Suscripciones',
      titleTextStyle: {
        fontSize: 14,
        bold: true
      },
      textStyle: {
        fontSize: 12
      },
      minValue: 0,
      format: '0' 
    },
    tooltip: {
      isHtml: true, 
      trigger: 'focus' 
    },
    lineWidth: 3,
    pointSize: 5,
    chartArea: {
      left: 70,
      top: 50,
      width: '85%',
      height: '70%'
    },
    backgroundColor: 'transparent'
  };

  try {
    this.monthlySubscriptionsChart = new google.visualization.AreaChart(
      document.getElementById('monthlyChart')
    );
    this.monthlySubscriptionsChart.draw(data, options);
    console.log('Gráfico mensual dibujado exitosamente');
  } catch (error) {
    console.error('Error al dibujar el gráfico mensual:', error);
  }
}
  exportActiveSubscriptionsChart(): void {
    if (!this.activeSubscriptionsChart) {
      alert('El gráfico no está disponible para exportar');
      return;
    }

    try {
      const imgUri = this.activeSubscriptionsChart.getImageURI();
      
      const link = document.createElement('a');
      link.download = `suscripciones_activas_${new Date().toISOString().split('T')[0]}.png`;
      link.href = imgUri;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error al exportar gráfico:', error);
      alert('Error al exportar el gráfico. Intenta nuevamente.');
    }
  }

  exportMonthlyChart(): void {
    if (!this.monthlySubscriptionsChart) {
      alert('El gráfico no está disponible para exportar');
      return;
    }

    try {
      const imgUri = this.monthlySubscriptionsChart.getImageURI();
      
      const link = document.createElement('a');
      link.download = `suscripciones_mensuales_${new Date().toISOString().split('T')[0]}.png`;
      link.href = imgUri;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error al exportar gráfico:', error);
      alert('Error al exportar el gráfico. Intenta nuevamente.');
    }
  }

  exportDataAsCSV(): void {
    if (!this.dashboardData) {
      alert('No hay datos disponibles para exportar');
      return;
    }

    try {
      let csvContent = 'Métrica,Valor\n';
      csvContent += `Total de Suscripciones,${this.dashboardData.totalSubscriptions}\n`;
      csvContent += `Ingresos Totales,${this.dashboardData.totalRevenue}\n`;
      csvContent += `Suscripciones Activas,${this.dashboardData.activeSubscriptions}\n`;
      csvContent += `Suscripciones Inactivas,${this.dashboardData.inactiveSubscriptions}\n`;
      csvContent += `Con Descuento,${this.dashboardData.withDiscount}\n`;
      csvContent += `Sin Descuento,${this.dashboardData.withoutDiscount}\n`;
      
      if (this.dashboardData.subscriptionsByMonth?.length > 0) {
        csvContent += '\nMes,Cantidad de Suscripciones\n';
        this.dashboardData.subscriptionsByMonth.forEach(monthly => {
          csvContent += `${monthly.month},${monthly.count}\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `dashboard_suscripciones_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      alert('Error al exportar los datos. Intenta nuevamente.');
    }
  }

  getDiscountSubscriptionsPercentage(): number {
    if (!this.dashboardData || this.dashboardData.totalSubscriptions === 0) return 0;
    return Math.round((this.dashboardData.withDiscount / this.dashboardData.totalSubscriptions) * 100);
  }

  getActiveSubscriptionsPercentage(): number {
    if (!this.dashboardData || this.dashboardData.totalSubscriptions === 0) return 0;
    return Math.round((this.dashboardData.activeSubscriptions / this.dashboardData.totalSubscriptions) * 100);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }
}