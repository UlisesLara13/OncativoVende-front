import { NgModule } from '@angular/core';
import { DecimalFormatPipe } from './decimal-format.pipe'; 

@NgModule({
  declarations: [DecimalFormatPipe],  
  exports: [DecimalFormatPipe]        
})
export class PipesModule {}