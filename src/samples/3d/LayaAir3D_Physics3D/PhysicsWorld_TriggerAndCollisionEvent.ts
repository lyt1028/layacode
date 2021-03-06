import { Laya } from "Laya";
import { Script3D } from "laya/d3/component/Script3D";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { Collision } from "laya/d3/physics/Collision";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { PhysicsComponent } from "laya/d3/physics/PhysicsComponent";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { CapsuleColliderShape } from "laya/d3/physics/shape/CapsuleColliderShape";
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { KeyBoardManager } from "laya/events/KeyBoardManager";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { Config3D } from "Config3D";

export class PhysicsWorld_TriggerAndCollisionEvent {

	private scene: Scene3D;
	private camera: Camera;
	private kinematicSphere: Sprite3D;

	private translateW: Vector3 = new Vector3(0, 0, -0.2);
	private translateS: Vector3 = new Vector3(0, 0, 0.2);
	private translateA: Vector3 = new Vector3(-0.2, 0, 0);
	private translateD: Vector3 = new Vector3(0.2, 0, 0);
	private translateQ: Vector3 = new Vector3(-0.01, 0, 0);
	private translateE: Vector3 = new Vector3(0.01, 0, 0);

	private plane: MeshSprite3D;

	constructor() {
		//???????????????
		Laya3D.init(0, 0, null, Handler.create(null, () => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//??????????????????
			Stat.show();
			Config3D.useCannonPhysics = false;
			//????????????
			this.scene = new Scene3D();
			Laya.stage.addChild(this.scene);

			//????????????
			this.camera = new Camera(0, 0.1, 100);
			this.scene.addChild(this.camera);
			this.camera.transform.translate(new Vector3(0, 8, 18));
			this.camera.transform.rotate(new Vector3(-30, 0, 0), true, false);
			this.camera.clearColor = null;

			//????????????
			var directionLight = new DirectionLight();
			this.scene.addChild(directionLight);
			directionLight.color = new Vector3(1, 1, 1);
			//????????????????????????
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, 1.0));
			directionLight.transform.worldMatrix = mat;

			//????????????
			this.plane = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(20, 20, 10, 10))));
			//??????BlinnPhong??????
			var planeMat: BlinnPhongMaterial = new BlinnPhongMaterial();
			//????????????
			Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex: Texture2D): void {
				planeMat.albedoTexture = tex;
			}));
			//????????????
			planeMat.tilingOffset = new Vector4(2, 2, 0, 0);
			this.plane.meshRenderer.material = planeMat;

			//??????????????????
			var staticCollider: PhysicsCollider = (<PhysicsCollider>this.plane.addComponent(PhysicsCollider));
			//?????????????????????
			var boxShape: BoxColliderShape = new BoxColliderShape(20, 0, 20);
			//?????????????????????????????????
			staticCollider.colliderShape = boxShape;
			//?????????????????????
			this.addKinematicSphere();
			for (var i: number = 0; i < 30; i++) {
				this.addBoxAndTrigger();
				this.addCapsuleCollision();
			}
		}));
	}

	addKinematicSphere(): void {
		//??????BlinnPhong??????
		var mat2: BlinnPhongMaterial = new BlinnPhongMaterial();
		//????????????
		Texture2D.load("res/threeDimen/Physics/plywood.jpg", Handler.create(this, function (tex: Texture2D): void {
			mat2.albedoTexture = tex;
		}));
		//???????????????????????????
		mat2.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);

		//????????????MeshSprite3D
		var radius: number = 0.8;
		var sphere: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(radius))));
		sphere.meshRenderer.material = mat2;
		var pos: Vector3 = sphere.transform.position;
		pos.setValue(0, 0.8, 0);
		sphere.transform.position = pos;

		//?????????????????????
		var rigidBody: Rigidbody3D = sphere.addComponent(Rigidbody3D);
		//?????????????????????
		var sphereShape: SphereColliderShape = new SphereColliderShape(radius);
		//?????????????????????????????????????????????
		rigidBody.colliderShape = sphereShape;
		//?????????????????????
		rigidBody.mass = 60;
		//????????????????????????????????????true????????????transform??????????????????,??????????????????????????????
		rigidBody.isKinematic = true;

		this.kinematicSphere = sphere;
		//???????????????????????????????????????(????????????)????????????????????????????????????
		Laya.timer.frameLoop(1, this, this.onKeyDown);
	}

	private onKeyDown(): void {
		KeyBoardManager.hasKeyDown(87) && this.kinematicSphere.transform.translate(this.translateW);//W
		KeyBoardManager.hasKeyDown(83) && this.kinematicSphere.transform.translate(this.translateS);//S
		KeyBoardManager.hasKeyDown(65) && this.kinematicSphere.transform.translate(this.translateA);//A
		KeyBoardManager.hasKeyDown(68) && this.kinematicSphere.transform.translate(this.translateD);//D
		KeyBoardManager.hasKeyDown(81) && this.plane.transform.translate(this.translateQ);//Q
		KeyBoardManager.hasKeyDown(69) && this.plane.transform.translate(this.translateE);//E
	}

	addBoxAndTrigger(): void {
		//??????BlinnPhong??????
		var mat1: BlinnPhongMaterial = new BlinnPhongMaterial();
		Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, function (tex: Texture2D): void {
			mat1.albedoTexture = tex;
		}));
		//?????????????????????
		mat1.albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);

		//??????????????????
		var sX: number = Math.random() * 0.75 + 0.25;
		var sY: number = Math.random() * 0.75 + 0.25;
		var sZ: number = Math.random() * 0.75 + 0.25;
		//????????????MeshSprite3D
		var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ))));
		//????????????
		box.meshRenderer.material = mat1;

		var transform: Transform3D = box.transform;
		//????????????
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 16 - 8, sY / 2, Math.random() * 16 - 8);
		transform.position = pos;
		//???????????????
		var rotationEuler: Vector3 = transform.rotationEuler;
		rotationEuler.setValue(0, Math.random() * 360, 0);
		transform.rotationEuler = rotationEuler;

		//?????????????????????
		var staticCollider: PhysicsCollider = box.addComponent(PhysicsCollider);//StaticCollider?????????Kinematic??????RigidBody3D????????????
		//?????????????????????
		var boxShape: BoxColliderShape = new BoxColliderShape(sX, sY, sZ);
		staticCollider.colliderShape = boxShape;
		//??????????????????,??????????????????
		staticCollider.isTrigger = true;
		//???????????????????????????
		var script: TriggerCollisionScript = box.addComponent(TriggerCollisionScript);
		script.kinematicSprite = this.kinematicSphere;
	}

	addCapsuleCollision(): void {
		var mat3: BlinnPhongMaterial = new BlinnPhongMaterial();
		Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex: Texture2D): void {
			mat3.albedoTexture = tex;
		}));

		var raidius: number = Math.random() * 0.2 + 0.2;
		var height: number = Math.random() * 0.5 + 0.8;
		var capsule: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(raidius, height))));
		capsule.meshRenderer.material = mat3;

		var transform: Transform3D = capsule.transform;
		//????????????
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
		transform.position = pos;
		//???????????????
		var rotationEuler: Vector3 = transform.rotationEuler;
		rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;

		var rigidBody: Rigidbody3D = capsule.addComponent(Rigidbody3D);//Rigidbody3D??????StaticCollider???RigidBody3D????????????
		var sphereShape: CapsuleColliderShape = new CapsuleColliderShape(raidius, height);
		rigidBody.colliderShape = sphereShape;
		rigidBody.mass = 10;
		var script: TriggerCollisionScript = capsule.addComponent(TriggerCollisionScript);
		script.kinematicSprite = this.kinematicSphere;

	}

	addSphere(): void {
		var mat2: BlinnPhongMaterial = new BlinnPhongMaterial();
		Texture2D.load("res/threeDimen/Physics/plywood.jpg", Handler.create(this, function (tex: Texture2D): void {
			mat2.albedoTexture = tex;
		}));

		var radius: number = Math.random() * 0.2 + 0.2;
		var sphere: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(radius))));
		sphere.meshRenderer.material = mat2;
		var pos: Vector3 = sphere.transform.position;
		pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
		sphere.transform.position = pos;

		var rigidBody: Rigidbody3D = sphere.addComponent(Rigidbody3D);
		var sphereShape: SphereColliderShape = new SphereColliderShape(radius);
		rigidBody.colliderShape = sphereShape;
		rigidBody.mass = 10;
	}
}








class TriggerCollisionScript extends Script3D {
	kinematicSprite: Sprite3D;

	constructor() {
		super();


	}

	//?????????????????????
	/*override*/  onTriggerEnter(other: PhysicsComponent): void {
		((<BlinnPhongMaterial>((<MeshRenderer>((<MeshSprite3D>this.owner)).meshRenderer)).sharedMaterial)).albedoColor = new Vector4(0.0, 1.0, 0.0, 1.0);
		console.log("onTriggerEnter");
	}

	//?????????????????????
	/*override*/  onTriggerStay(other: PhysicsComponent): void {
		console.log("onTriggerStay");
	}

	//?????????????????????
	/*override*/  onTriggerExit(other: PhysicsComponent): void {
		((<BlinnPhongMaterial>((<MeshRenderer>((<MeshSprite3D>this.owner)).meshRenderer)).sharedMaterial)).albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
		console.log("onTriggerExit");
	}

	//?????????????????????
	/*override*/  onCollisionEnter(collision: Collision): void {
		if (collision.other.owner === this.kinematicSprite)
			((<BlinnPhongMaterial>((<MeshRenderer>((<MeshSprite3D>this.owner)).meshRenderer)).sharedMaterial)).albedoColor = new Vector4(0.0, 0.0, 0.0, 1.0);
	}

	//?????????????????????
	/*override*/  onCollisionStay(collision: Collision): void {
	}

	//?????????????????????
	/*override*/  onCollisionExit(collision: Collision): void {
	}

}
