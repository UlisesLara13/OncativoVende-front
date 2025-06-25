import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DashboardsService } from '../../services/dashboards.service';
import { CommonModule } from '@angular/common';
import { UserDashboardDto } from '../../models/UserDahsboardDto';
import { interval, Subscription } from 'rxjs';


declare var google: any;

@Component({
  selector: 'app-charts-user',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './charts-user.component.html',
  styleUrl: './charts-user.component.css'
})
export class ChartsUserComponent implements OnInit {

  filterForm: FormGroup;
  dashboardData: UserDashboardDto | null = null;
  loading = false;


  private activeUsersChart: any;
  private locationChart: any;

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
    google.charts.load('current', { packages: ['corechart', 'bar'] });
    google.charts.setOnLoadCallback(() => {
      this.loadDashboardData();
    });
  }

  loadDashboardData(): void {
    this.loading = true;
    const filters = this.filterForm.value;
    
    this.dashboardService.getUserDashboard(filters.from, filters.to)
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.loading = false;
          this.drawCharts();
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
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

    setTimeout(() => {
      this.drawActiveUsersChart();
      this.drawLocationChart();
    }, 100);
  }

  private drawActiveUsersChart(): void {
    if (!this.dashboardData) return;

    const data = google.visualization.arrayToDataTable([
      ['Estado', 'Cantidad'],
      ['Usuarios Activos', this.dashboardData.activeUsers],
      ['Usuarios Inactivos', this.dashboardData.inactiveUsers]
    ]);

    const options = {
      title: 'Distribución de Usuarios Activos/Inactivos',
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

    this.activeUsersChart = new google.visualization.PieChart(
      document.getElementById('activeUsersChart')
    );
    this.activeUsersChart.draw(data, options);
  }

  private drawLocationChart(): void {
  if (!this.dashboardData?.usersByLocation?.length) return;

  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Localidad');
  data.addColumn('number', 'Cantidad de Usuarios');
  data.addColumn({ type: 'string', role: 'style' });
  data.addColumn({ type: 'number', role: 'annotation' });
  data.addColumn({ type: 'string', role: 'tooltip', p: { html: true } });

  const colors = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
    '#6f42c1', '#fd7e14', '#20c997', '#343a40'
  ];

  this.dashboardData.usersByLocation.forEach((loc, index) => {
    const color = colors[index % colors.length];

    const tooltip = `
      <div style="min-width: 150px; padding: 6px;">
        <strong>${loc.location}</strong><br/>
        ${loc.count} usuarios
      </div>
    `;

    data.addRow([loc.location, loc.count, `color: ${color}`, loc.count, tooltip]);
  });

  const options = {
    title: 'Usuarios por Localidad',
    titleTextStyle: {
      fontSize: 16,
      bold: true
    },
    hAxis: {
      title: 'Cantidad de Usuarios',
      minValue: 0,
      titleTextStyle: {
        fontSize: 14,
        bold: true
      },
      textStyle: {
        fontSize: 12
      }
    },
    vAxis: {
      title: 'Localidades',
      titleTextStyle: {
        fontSize: 14,
        bold: true
      },
      textStyle: {
        fontSize: 12
      }
    },
    legend: { position: 'none' },
    chartArea: {
      left: 140,
      top: 50,
      width: '70%',
      height: '80%'
    },
    bar: {
      groupWidth: '75%'
    },
    tooltip: {
      isHtml: true,
      textStyle: {
        fontSize: 12
      }
    },
    annotations: {
      textStyle: {
        fontSize: 12,
        color: '#000',
        bold: true
      }
    }
  };

  this.locationChart = new google.visualization.BarChart(
    document.getElementById('locationChart')
  );
  this.locationChart.draw(data, options);
}
  exportActiveUsersChart(): void {
    if (!this.activeUsersChart) {
      alert('El gráfico no está disponible para exportar');
      return;
    }

    try {
      const imgUri = this.activeUsersChart.getImageURI();
      
      const link = document.createElement('a');
      link.download = `usuarios_activos_${new Date().toISOString().split('T')[0]}.png`;
      link.href = imgUri;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error al exportar gráfico:', error);
      alert('Error al exportar el gráfico. Intenta nuevamente.');
    }
  }

  exportLocationChart(): void {
    if (!this.locationChart) {
      alert('El gráfico no está disponible para exportar');
      return;
    }

    try {
      const imgUri = this.locationChart.getImageURI();
      
      const link = document.createElement('a');
      link.download = `usuarios_por_localidad_${new Date().toISOString().split('T')[0]}.png`;
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
      csvContent += `Total de Usuarios,${this.dashboardData.totalUsers}\n`;
      csvContent += `Usuarios Activos,${this.dashboardData.activeUsers}\n`;
      csvContent += `Usuarios Inactivos,${this.dashboardData.inactiveUsers}\n`;
      csvContent += `Usuarios Premium,${this.dashboardData.premiumUsers}\n`;
      csvContent += `Usuarios Verificados,${this.dashboardData.verifiedUsers}\n`;
      csvContent += `Usuarios No Verificados,${this.dashboardData.unverifiedUsers}\n`;
      csvContent += `Usuarios Estándar,${this.dashboardData.standardUsers}\n`;
      
      if (this.dashboardData.usersByLocation?.length > 0) {
        csvContent += '\nLocalidad,Cantidad de Usuarios\n';
        this.dashboardData.usersByLocation.forEach(location => {
          csvContent += `${location.location},${location.count}\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `dashboard_usuarios_${new Date().toISOString().split('T')[0]}.csv`);
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

  getPremiumUsersPercentage(): number {
    if (!this.dashboardData || this.dashboardData.totalUsers === 0) return 0;
    return Math.round((this.dashboardData.premiumUsers / this.dashboardData.totalUsers) * 100);
  }

  getVerifiedUsersPercentage(): number {
    if (!this.dashboardData || this.dashboardData.totalUsers === 0) return 0;
    return Math.round((this.dashboardData.verifiedUsers / this.dashboardData.totalUsers) * 100);
  }
}
