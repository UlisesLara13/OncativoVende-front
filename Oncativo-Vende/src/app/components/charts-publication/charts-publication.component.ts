import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PublicationDashboardDto } from '../../models/PublicationDashboardDto';
import { DashboardsService } from '../../services/dashboards.service';
import { PipesModule } from '../../pipes/pipes.module';

declare var google: any;

@Component({
  selector: 'app-charts-publication',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PipesModule],
  templateUrl: './charts-publication.component.html',
  styleUrl: './charts-publication.component.css'
})
export class ChartsPublicationComponent implements OnInit {

  filterForm: FormGroup;
  dashboardData: PublicationDashboardDto | null = null;
  loading = false;

  private activePublicationsChart: any;
  private categoryChart: any;
  private tagChart: any;
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
    
    this.dashboardService.getPublicationDashboard(filters.from, filters.to)
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
      this.drawActivePublicationsChart();
      this.drawCategoryChart();
      this.drawTagChart();
      this.drawLocationChart();
    }, 100);
  }

  private drawActivePublicationsChart(): void {
    if (!this.dashboardData) return;

    const data = google.visualization.arrayToDataTable([
      ['Estado', 'Cantidad'],
      ['Publicaciones Activas', this.dashboardData.activePublications],
      ['Publicaciones Inactivas', this.dashboardData.inactivePublications]
    ]);

    const options = {
      title: 'Distribución de Publicaciones Activas/Inactivas',
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

    this.activePublicationsChart = new google.visualization.PieChart(
      document.getElementById('activePublicationsChart')
    );
    this.activePublicationsChart.draw(data, options);
  }

  private drawCategoryChart(): void {
  if (!this.dashboardData?.publicationsByCategory?.length) return;

  const raw = this.dashboardData.publicationsByCategory;
  const total = raw.reduce((sum, item) => sum + item.count, 0);

  const chartData: (string | number)[][] = [['Categoría', 'Cantidad de Publicaciones']];

  raw.forEach(category => {
    const percentage = ((category.count / total) * 100).toFixed(1);
    const label = `${category.label} (${category.count})`;
    chartData.push([label, category.count]);
  });

  const data = google.visualization.arrayToDataTable(chartData);

  const options = {
    titleTextStyle: {
      fontSize: 16,
      bold: true
    },
    pieHole: 0.4,
    colors: ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1', '#fd7e14', '#20c997'],
    legend: {
      position: 'right',
      alignment: 'center',
      textStyle: {
        fontSize: 12
      }
    },
    chartArea: {
      left: 20,
      top: 50,
      width: '75%',
      height: '80%'
    },
    tooltip: {
      text: 'percentage',
    }
  };

  this.categoryChart = new google.visualization.PieChart(
    document.getElementById('categoryChart')
  );
  this.categoryChart.draw(data, options);
}

  private drawTagChart(): void {
  if (!this.dashboardData?.publicationsByTag?.length) return;

  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Tag');
  data.addColumn('number', 'Cantidad de Publicaciones');
  data.addColumn({ type: 'string', role: 'style' });
  data.addColumn({ type: 'string', role: 'tooltip', p: { html: true } });

  const tagColorMap: { [label: string]: string } = {
    'nuevo': '#28a745',
    'usado': '#dc3545',
    'envío incluido': '#17a2b8',
    'retiro en mano': '#20c997',
    'punto de encuentro': '#6f42c1',
    'precio negociable': '#ffc107',
    'precio fijo': '#007bff'
  };

  this.dashboardData.publicationsByTag.forEach(tag => {
    const key = tag.label.toLowerCase().trim();
    const color = tagColorMap[key] || '#6c757d';

    const tooltip = `
      <div style="min-width: 150px; padding: 6px;">
        <strong>${tag.label}</strong><br/>
        ${tag.count} publicaciones
      </div>
    `;

    data.addRow([tag.label, tag.count, `color: ${color}`, tooltip]);
  });

  const options = {
    titleTextStyle: {
      fontSize: 16,
      bold: true
    },
    hAxis: {
      title: 'Tags',
      titleTextStyle: {
        fontSize: 14,
        bold: true
      },
      textStyle: {
        fontSize: 11
      }
    },
    vAxis: {
      title: 'Cantidad de Publicaciones',
      titleTextStyle: {
        fontSize: 14,
        bold: true
      },
      minValue: 0,
      format: '0',
      textStyle: {
        fontSize: 12
      }
    },
    legend: { position: 'none' },
    chartArea: {
      left: 60,
      top: 50,
      width: '85%',
      height: '70%'
    },
    bar: {
      groupWidth: '75%'
    },
    tooltip: {
      isHtml: true,
      textStyle: {
        fontSize: 14
      }
    }
  };

  this.tagChart = new google.visualization.ColumnChart(
    document.getElementById('tagChart')
  );
  this.tagChart.draw(data, options);
}


  private drawLocationChart(): void {
  if (!this.dashboardData?.publicationsByLocation?.length) return;

  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Localidad');
  data.addColumn('number', 'Cantidad de Publicaciones');
  data.addColumn({ type: 'string', role: 'style' });
  data.addColumn({ type: 'number', role: 'annotation' });
  data.addColumn({ type: 'string', role: 'tooltip', p: { html: true } });

  const colors = [
    '#fd7e14', '#20c997', '#6f42c1', '#007bff', '#28a745',
    '#dc3545', '#ffc107', '#17a2b8', '#343a40'
  ];

  this.dashboardData.publicationsByLocation.forEach((loc, index) => {
    const color = colors[index % colors.length];

    const tooltip = `
      <div style="min-width: 150px; padding: 6px;">
        <strong>${loc.label}</strong><br/>
        ${loc.count} publicaciones
      </div>
    `;

    data.addRow([loc.label, loc.count, `color: ${color}`, loc.count, tooltip]);
  });

  const options = {
    titleTextStyle: {
      fontSize: 16,
      bold: true
    },
    hAxis: {
      title: 'Cantidad de Publicaciones',
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

  exportActivePublicationsChart(): void {
    if (!this.activePublicationsChart) {
      alert('El gráfico no está disponible para exportar');
      return;
    }

    try {
      const imgUri = this.activePublicationsChart.getImageURI();
      
      const link = document.createElement('a');
      link.download = `publicaciones_activas_${new Date().toISOString().split('T')[0]}.png`;
      link.href = imgUri;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error al exportar gráfico:', error);
      alert('Error al exportar el gráfico. Intenta nuevamente.');
    }
  }

  exportCategoryChart(): void {
    if (!this.categoryChart) {
      alert('El gráfico no está disponible para exportar');
      return;
    }

    try {
      const imgUri = this.categoryChart.getImageURI();
      
      const link = document.createElement('a');
      link.download = `publicaciones_por_categoria_${new Date().toISOString().split('T')[0]}.png`;
      link.href = imgUri;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error al exportar gráfico:', error);
      alert('Error al exportar el gráfico. Intenta nuevamente.');
    }
  }

  exportTagChart(): void {
    if (!this.tagChart) {
      alert('El gráfico no está disponible para exportar');
      return;
    }

    try {
      const imgUri = this.tagChart.getImageURI();
      
      const link = document.createElement('a');
      link.download = `publicaciones_por_tags_${new Date().toISOString().split('T')[0]}.png`;
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
      link.download = `publicaciones_por_localidad_${new Date().toISOString().split('T')[0]}.png`;
      link.href = imgUri;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error al exportar gráfico:', error);
      alert('Error al exportar el gráfico. Intenta nuevamente.');
    }
  }

  getAveragePrice(): number {
    if (!this.dashboardData || this.dashboardData.averagePrice === null || this.dashboardData.totalPublications === 0) {
      return 0;
    }
    return this.dashboardData.averagePrice / this.dashboardData.totalPublications;
  }

  exportDataAsCSV(): void {
    if (!this.dashboardData) {
      alert('No hay datos disponibles para exportar');
      return;
    }

    try {
      let csvContent = 'Métrica,Valor\n';
      csvContent += `Total de Publicaciones,${this.dashboardData.totalPublications}\n`;
      csvContent += `Publicaciones Activas,${this.dashboardData.activePublications}\n`;
      csvContent += `Publicaciones Inactivas,${this.dashboardData.inactivePublications}\n`;
      csvContent += `Total de Visitas,${this.dashboardData.totalViews}\n`;
      csvContent += `Precio Promedio,$${this.dashboardData.averagePrice}\n`;
      
      if (this.dashboardData.publicationsByCategory?.length > 0) {
        csvContent += '\nCategoría,Cantidad de Publicaciones\n';
        this.dashboardData.publicationsByCategory.forEach(category => {
          csvContent += `${category.label},${category.count}\n`;
        });
      }

      if (this.dashboardData.publicationsByTag?.length > 0) {
        csvContent += '\nTag,Cantidad de Publicaciones\n';
        this.dashboardData.publicationsByTag.forEach(tag => {
          csvContent += `${tag.label},${tag.count}\n`;
        });
      }

      if (this.dashboardData.publicationsByLocation?.length > 0) {
        csvContent += '\nLocalidad,Cantidad de Publicaciones\n';
        this.dashboardData.publicationsByLocation.forEach(location => {
          csvContent += `${location.label},${location.count}\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `dashboard_publicaciones_${new Date().toISOString().split('T')[0]}.csv`);
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

  getActivePublicationsPercentage(): number {
    if (!this.dashboardData || this.dashboardData.totalPublications === 0) return 0;
    return Math.round((this.dashboardData.activePublications / this.dashboardData.totalPublications) * 100);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  }

}
