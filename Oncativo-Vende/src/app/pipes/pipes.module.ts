import { NgModule } from '@angular/core';
import { DecimalFormatPipe } from './decimal-format.pipe';
import { TruncatePipe } from './truncate.pipe';

@NgModule({
  imports: [DecimalFormatPipe,TruncatePipe],  
  exports: [DecimalFormatPipe,TruncatePipe]        
})
export class PipesModule {}