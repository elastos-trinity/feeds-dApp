import { Component, OnInit,Input,Output,EventEmitter} from '@angular/core';
import { ApiUrl } from '../../services/ApiUrl';
import { Web3Service } from '../../services/Web3Service';
@Component({
  selector: 'app-assetitem',
  templateUrl: './assetitem.component.html',
  styleUrls: ['./assetitem.component.scss'],
})
export class AssetitemComponent implements OnInit {
  @Input () assetItem:any = null;
  @Output() clickAssetItem = new EventEmitter();
  constructor(
    private web3Service:Web3Service
  ) { }

  ngOnInit() {}

  clickItem(){
    this.clickAssetItem.emit(this.assetItem);
  }

  hanldeImg(imgUri:string){
    if(imgUri.indexOf("feeds:imgage:")>-1){
      imgUri = imgUri.replace("feeds:imgage:","");
      imgUri = ApiUrl.nftGet+imgUri;
    }
    return imgUri;
  }

  hanldePrice(price:string){
     return this.web3Service.getFromWei(price);
  }

}