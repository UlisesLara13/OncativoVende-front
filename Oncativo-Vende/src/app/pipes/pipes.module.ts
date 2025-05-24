import { NgModule } from '@angular/core';
import { DecimalFormatPipe } from './decimal-format.pipe';

@NgModule({
  imports: [DecimalFormatPipe],  
  exports: [DecimalFormatPipe]        
})
export class PipesModule {}