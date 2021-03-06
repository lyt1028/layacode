import { Laya } from "Laya";
import { Camera, CameraEventFlags } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector2 } from "laya/d3/math/Vector2";
import { Vector4 } from "laya/d3/math/Vector4";
import { Viewport } from "laya/d3/math/Viewport";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { RenderTexture } from "laya/d3/resource/RenderTexture";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { FilterMode } from "laya/resource/FilterMode";
import { RenderTextureDepthFormat, RenderTextureFormat } from "laya/resource/RenderTextureFormat";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { SeparableSSS_BlitMaterial } from "./SeparableSSSRender/Material/SeparableSSS_BlitMaterial";
import { SeparableSSSRenderMaterial } from "./SeparableSSSRender/Material/SeparableSSS_RenderMaterial";
import { Event } from "laya/events/Event";
import { Utils } from "laya/utils/Utils";
import Client from "../../Client";

export class SeparableSSS_RenderDemo{
    scene:Scene3D;
    mainCamera:Camera;
    blinnphongCharacter:MeshSprite3D;
    SSSSSCharacter:MeshSprite3D;
    characterBlinnphongMaterial:BlinnPhongMaterial;
    pbrCharacter:MeshSprite3D;
    pbrMaterial:PBRStandardMaterial;
    //testPlane
    planeMat:UnlitMaterial;
    sssssBlitMaterail:SeparableSSS_BlitMaterial;
    sssssRenderMaterial:SeparableSSSRenderMaterial;

    /**????????????*/
	private btype:any = "SeparableSSS_RenderDemo";
	/**?????????????????????*/
	private stype:any = 0;
    private changeActionButton:Button;
    isMaster: any;
   
    //reference:https://github.com/iryoku/separable-sss 
    //???????????????????????????Mesh????????????????????????????????????Mesh???????????????,????????????????????????FrameBuffer???
    //??????????????????kenerl??????????????????????????????????????????
    //???????????????????????????????????????????????????
    constructor(){
        Laya3D.init(0,0);
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Stat.show();
        Shader3D.debugMode = true;
        SeparableSSS_BlitMaterial.init();
        SeparableSSSRenderMaterial.init();
        
        this.sssssBlitMaterail = new SeparableSSS_BlitMaterial();
        this.sssssRenderMaterial = new SeparableSSSRenderMaterial();
        this.PreloadingRes();
        
        this.isMaster = Utils.getQueryString("isMaster");
		this.initEvent();
	}
	
	initEvent()
	{
		Laya.stage.on("next",this,this.onNext);
	}

	/**
	 * 
	 * @param data {btype:""}
	 */
	onNext(data:any)
	{
		if(this.isMaster)return;//?????????????????????????????????
		if(data.btype == this.btype)
		{
			this.stypeFun(data.value);
		}
	}

    //?????????????????????
	PreloadingRes() {
		//?????????????????????
		let resource: any[] = ["res/threeDimen/LayaScene_separable-sss/Conventional/separable-sss.ls",
								"res/threeDimen/LayaScene_separable-sss/Conventional/HeadBlinnphong.lh"];
		Laya.loader.create(resource, Handler.create(this, this.onPreLoadFinish));
	}
   
    onPreLoadFinish(){
        this.scene = Loader.getRes("res/threeDimen/LayaScene_separable-sss/Conventional/separable-sss.ls");
        Laya.stage.addChild(this.scene);
            //????????????????????????
        this.mainCamera = (<Camera>this.scene.getChildByName("Main Camera"));
        this.mainCamera.addComponent(CameraMoveScript);

        
        //??????depthTexture
        this.blinnphongCharacter = Loader.getRes("res/threeDimen/LayaScene_separable-sss/Conventional/HeadBlinnphong.lh");
        this.characterBlinnphongMaterial = <BlinnPhongMaterial>this.blinnphongCharacter.meshRenderer.sharedMaterial.clone();
        //??????Mesh??????
        let buf = this.createCommandBuffer(this.mainCamera,this.blinnphongCharacter.meshFilter.sharedMesh);
        this.mainCamera.addCommandBuffer(CameraEventFlags.BeforeForwardOpaque,buf);
        this.sssssBlitMaterail.cameraFiledOfView=this.mainCamera.fieldOfView;

        //????????????
        this.SSSSSCharacter = <MeshSprite3D>this.blinnphongCharacter.clone();
        this.SSSSSCharacter.meshRenderer.sharedMaterial = this.sssssRenderMaterial;
        this.scene.addChild(this.SSSSSCharacter);
        this.scene.addChild(this.blinnphongCharacter);
        this.blinnphongCharacter.active = false;
        
        this.loadUI();
    }

    createCommandBuffer(camera:Camera,character:Mesh):CommandBuffer{
        //??????????????????????????????????????????????????????
        let oriColor = this.characterBlinnphongMaterial.albedoColor;
        let oriSpec = this.characterBlinnphongMaterial.specularColor;

        let buf:CommandBuffer = new CommandBuffer();
        let viewPort:Viewport = camera.viewport;

        //????????????????????????  ???????????????????????????????????????
        //??????????????????????????????  ??????????????????drawMesh?????????
        //????????????
        let depthTexture = RenderTexture.createFromPool(viewPort.width,viewPort.height,RenderTextureFormat.Depth);
        buf.setRenderTarget(depthTexture);
        buf.clearRenderTarget(true,true,new Vector4(0.5,0.5,0.5,1.0));
        buf.drawMesh(character,this.blinnphongCharacter.transform.worldMatrix,this.characterBlinnphongMaterial,0,0);
        //???????????????????????????????????????RenderTexture
        //???????????????
        let diffuseRenderTexture = RenderTexture.createFromPool(viewPort.width,viewPort.height,RenderTextureFormat.R8G8B8A8,RenderTextureDepthFormat.DEPTH_16);
        buf.setRenderTarget(diffuseRenderTexture);
        buf.clearRenderTarget(true,true,new Vector4(0.5,0.5,0.5,1.0));
        //@ts-ignore
        buf.setShaderDataVector(this.characterBlinnphongMaterial.shaderData,BlinnPhongMaterial.ALBEDOCOLOR,oriColor);
        //@ts-ignore
        buf.setShaderDataVector(this.characterBlinnphongMaterial.shaderData,BlinnPhongMaterial.MATERIALSPECULAR,new Vector4(0.0,0.0,0.0,0.0));
        buf.drawMesh(character,this.blinnphongCharacter.transform.worldMatrix,this.characterBlinnphongMaterial,0,0);
        // //????????????
        let specRrenderTexture = RenderTexture.createFromPool(viewPort.width,viewPort.height,RenderTextureFormat.R8G8B8A8,RenderTextureDepthFormat.DEPTH_16);
        buf.setRenderTarget(specRrenderTexture);
        buf.clearRenderTarget(true,true,new Vector4(1.0,0.0,0.0,0.0));
        //@ts-ignore
        buf.setShaderDataVector(this.characterBlinnphongMaterial.shaderData,BlinnPhongMaterial.MATERIALSPECULAR,oriSpec);
        //@ts-ignore
        buf.setShaderDataVector(this.characterBlinnphongMaterial.shaderData,BlinnPhongMaterial.ALBEDOCOLOR,new Vector4(0.0,0.0,0.0,0.0));
        buf.drawMesh(character,this.blinnphongCharacter.transform.worldMatrix,this.characterBlinnphongMaterial,0,0);
        //buf.blitScreenQuad(specRrenderTexture,null);

        //???????????????????????????diffuse???????????????????????????
        buf.setShaderDataTexture(this.sssssBlitMaterail.shaderData,SeparableSSS_BlitMaterial.SHADERVALUE_DEPTHTEX,depthTexture);
        let blurRenderTexture = RenderTexture.createFromPool(viewPort.width,viewPort.height,RenderTextureFormat.R8G8B8A8,RenderTextureDepthFormat.DEPTHSTENCIL_NONE);
        buf.setShaderDataVector2(this.sssssBlitMaterail.shaderData,SeparableSSS_BlitMaterial.SHADERVALUE_BLURDIR,new Vector2(10.0,0.0));
        buf.blitScreenQuadByMaterial(diffuseRenderTexture,blurRenderTexture,new Vector4(0,0,1.0,1.0),this.sssssBlitMaterail,0);
        buf.setShaderDataVector2(this.sssssBlitMaterail.shaderData,SeparableSSS_BlitMaterial.SHADERVALUE_BLURDIR,new Vector2(0.0,10.0));
        buf.blitScreenQuadByMaterial(blurRenderTexture,diffuseRenderTexture,new Vector4(0.0,0.0,0.0,0.0),this.sssssBlitMaterail,0);
        

        buf.setGlobalTexture(Shader3D.propertyNameToID("sssssDiffuseTexture"),diffuseRenderTexture);
       this.sssssRenderMaterial.shaderData.setTexture(Shader3D.propertyNameToID("sssssSpecularTexture"),specRrenderTexture);
       diffuseRenderTexture.filterMode = FilterMode.Point;
       specRrenderTexture.filterMode = FilterMode.Point; 


        return buf;
    }


    curStateIndex:number = 0;
    //??????
    private loadUI(): void {

		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {

			this.changeActionButton = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "?????????????????????"));
			this.changeActionButton.size(160, 40);
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 30;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
			this.changeActionButton.on(Event.CLICK, this, this.stypeFun);
		}));
	}

    stypeFun(label:string = "?????????????????????"): void {
        if (++this.curStateIndex % 2 == 1) {
            this.blinnphongCharacter.active = true;
            this.SSSSSCharacter.active = false;
            this.changeActionButton.label = "????????????";
        } else {
            this.blinnphongCharacter.active = false;
            this.SSSSSCharacter.active = true;
            this.changeActionButton.label = "?????????????????????";
        }
        label = this.changeActionButton.label;
		if(this.isMaster)
		Client.instance.send({type:"next",btype:this.btype,stype:0,value:label});		
    }
}