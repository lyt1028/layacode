import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { CapsuleColliderShape } from "laya/d3/physics/shape/CapsuleColliderShape";
import { ConeColliderShape } from "laya/d3/physics/shape/ConeColliderShape";
import { CylinderColliderShape } from "laya/d3/physics/shape/CylinderColliderShape";
import { SphereColliderShape } from "laya/d3/physics/shape/SphereColliderShape";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Physics3DUtils } from "laya/d3/utils/Physics3DUtils";
import { Stage } from "laya/display/Stage";
import { KeyBoardManager } from "laya/events/KeyBoardManager";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { Config3D } from "Config3D";

export class PhysicsWorld_CollisionFiflter {

	private plane: MeshSprite3D;
	private scene: Scene3D;
	private camera: Camera;
	private kinematicSphere: Sprite3D;

	private translateW: Vector3 = new Vector3(0, 0, -0.2);
	private translateS: Vector3 = new Vector3(0, 0, 0.2);
	private translateA: Vector3 = new Vector3(-0.2, 0, 0);
	private translateD: Vector3 = new Vector3(0.2, 0, 0);
	private translateQ: Vector3 = new Vector3(-0.01, 0, 0);
	private translateE: Vector3 = new Vector3(0.01, 0, 0);

	private _albedoColor: Vector4 = new Vector4(1.0, 0.0, 0.0, 1.0);
	private tmpVector: Vector3 = new Vector3(0, 0, 0);

	private mat1: BlinnPhongMaterial;
	private mat2: BlinnPhongMaterial;
	private mat3: BlinnPhongMaterial;
	private mat4: BlinnPhongMaterial;
	private mat5: BlinnPhongMaterial;

	constructor() {
		//???????????????
		Laya3D.init(0, 0, null, Handler.create(null, () => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//??????????????????
			Stat.show();
			Config3D.useCannonPhysics = false;
			//????????????
			this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
			//????????????
			this.camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
			this.camera.transform.translate(new Vector3(0, 8, 18));
			this.camera.transform.rotate(new Vector3(-30, 0, 0), true, false);
			//???????????????????????????
			this.camera.clearColor = null;
			//???????????????
			var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
			directionLight.color = new Vector3(1, 1, 1);
			//????????????????????????
			var mat: Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, 1.0));
			directionLight.transform.worldMatrix = mat;
			this.mat1 = new BlinnPhongMaterial();
			this.mat2 = new BlinnPhongMaterial();
			this.mat3 = new BlinnPhongMaterial();
			this.mat4 = new BlinnPhongMaterial();
			this.mat5 = new BlinnPhongMaterial();
			//??????????????????
			Texture2D.load("res/threeDimen/Physics/rocks.jpg", Handler.create(this, function (tex: Texture2D): void {
				this.mat1.albedoTexture = tex;
			}));

			Texture2D.load("res/threeDimen/Physics/plywood.jpg", Handler.create(this, function (tex: Texture2D): void {
				this.mat2.albedoTexture = tex;
			}));

			Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex: Texture2D): void {
				this.mat3.albedoTexture = tex;
			}));

			Texture2D.load("res/threeDimen/Physics/steel2.jpg", Handler.create(this, function (tex: Texture2D): void {
				this.mat4.albedoTexture = tex;
			}));
			Texture2D.load("res/threeDimen/Physics/steel.jpg", Handler.create(this, function (tex: Texture2D): void {
				this.mat5.albedoTexture = tex;
			}));


			//????????????
			this.plane = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(20, 20, 10, 10))));
			var planeMat: BlinnPhongMaterial = new BlinnPhongMaterial();
			//????????????
			Texture2D.load("res/threeDimen/Physics/wood.jpg", Handler.create(this, function (tex: Texture2D): void {
				planeMat.albedoTexture = tex;
			}));
			//????????????
			planeMat.tilingOffset = new Vector4(2, 2, 0, 0);
			this.plane.meshRenderer.material = planeMat;
			//??????????????????????????????
			var staticCollider: PhysicsCollider = (<PhysicsCollider>this.plane.addComponent(PhysicsCollider));
			var boxShape: BoxColliderShape = new BoxColliderShape(20, 0, 20);
			staticCollider.colliderShape = boxShape;

			this.addKinematicSphere();
			for (var i: number = 0; i < 20; i++) {
				this.addBox();
				this.addCapsule();
				this.addCone();
				this.addCylinder();
				this.addSphere();
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
		mat2.albedoColor = this._albedoColor;
		//???????????????
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
		//???????????????????????????
		rigidBody.colliderShape = sphereShape;
		//?????????????????????
		rigidBody.mass = 60;
		//????????????????????????????????????,????????????transform??????????????????,??????????????????????????????
		rigidBody.isKinematic = true;
		//??????????????????????????????????????????
		rigidBody.canCollideWith = Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER1 | Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER3 | Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER5;//??????????????????135??????(??????????????????????????????

		this.kinematicSphere = sphere;
		//????????????????????????
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

	addBox(): void {
		//???????????????????????????
		var sX: number = Math.random() * 0.75 + 0.25;
		var sY: number = Math.random() * 0.75 + 0.25;
		var sZ: number = Math.random() * 0.75 + 0.25;
		//????????????MeshSprite3D
		var box: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(sX, sY, sZ))));
		//????????????
		box.meshRenderer.material = this.mat1;
		var transform: Transform3D = box.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 16 - 8, sY / 2, Math.random() * 16 - 8);
		transform.position = pos;
		//?????????????????????
		var rotationEuler: Vector3 = transform.rotationEuler;
		rotationEuler.setValue(0, Math.random() * 360, 0);
		transform.rotationEuler = rotationEuler;
		//?????????????????????
		var rigidBody: Rigidbody3D = box.addComponent(Rigidbody3D);
		//?????????????????????
		var boxShape: BoxColliderShape = new BoxColliderShape(sX, sY, sZ);
		//???????????????????????????
		rigidBody.colliderShape = boxShape;
		//?????????????????????
		rigidBody.mass = 10;
		//??????????????????????????????
		rigidBody.collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER1;//????????????1
	}

	addCapsule(): void {
		var raidius: number = Math.random() * 0.2 + 0.2;
		var height: number = Math.random() * 0.5 + 0.8;
		var capsule: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(raidius, height))));
		capsule.meshRenderer.material = this.mat3;
		var transform: Transform3D = capsule.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 4 - 2, 2, Math.random() * 4 - 2);
		transform.position = pos;
		//?????????????????????
		var rotationEuler: Vector3 = transform.rotationEuler;
		rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;

		var rigidBody: Rigidbody3D = capsule.addComponent(Rigidbody3D);
		var sphereShape: CapsuleColliderShape = new CapsuleColliderShape(raidius, height);
		rigidBody.colliderShape = sphereShape;
		rigidBody.mass = 10;
		rigidBody.collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER2;//????????????2,???????????????

	}

	addCone(): void {
		var raidius: number = Math.random() * 0.2 + 0.2;
		var height: number = Math.random() * 0.5 + 0.8;
		//????????????MeshSprite3D
		var cone: MeshSprite3D = new MeshSprite3D(PrimitiveMesh.createCone(raidius, height));
		this.scene.addChild(cone);
		//????????????
		cone.meshRenderer.material = this.mat4;
		//????????????
		var transform: Transform3D = cone.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
		transform.position = pos;

		//?????????????????????
		var rigidBody: Rigidbody3D = cone.addComponent(Rigidbody3D);
		//?????????????????????
		var coneShape: ConeColliderShape = new ConeColliderShape(raidius, height);
		//??????????????????????????????
		rigidBody.colliderShape = coneShape;
		//??????????????????????????????
		rigidBody.mass = 10;
		rigidBody.collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER3;//????????????3
	}

	addCylinder(): void {
		var mat5: BlinnPhongMaterial = new BlinnPhongMaterial();
		Texture2D.load("res/threeDimen/Physics/steel.jpg", Handler.create(this, function (tex: Texture2D): void {
			mat5.albedoTexture = tex;
		}));
		var raidius: number = Math.random() * 0.2 + 0.2;
		var height: number = Math.random() * 0.5 + 0.8;
		//????????????MeshSprite3D
		var cylinder: MeshSprite3D = new MeshSprite3D(PrimitiveMesh.createCylinder(raidius, height));
		this.scene.addChild(cylinder);
		//????????????
		cylinder.meshRenderer.material = mat5;
		var transform: Transform3D = cylinder.transform;
		var pos: Vector3 = transform.position;
		pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
		transform.position = pos;
		//?????????????????????
		var rotationEuler: Vector3 = transform.rotationEuler;
		rotationEuler.setValue(Math.random() * 360, Math.random() * 360, Math.random() * 360);
		transform.rotationEuler = rotationEuler;

		//?????????????????????
		var rigidBody: Rigidbody3D = cylinder.addComponent(Rigidbody3D);
		//?????????????????????
		var cylinderShape: CylinderColliderShape = new CylinderColliderShape(raidius, height);
		//??????????????????????????????
		rigidBody.colliderShape = cylinderShape;
		//??????????????????????????????
		rigidBody.mass = 10;
		rigidBody.collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER4;//????????????4
	}

	addSphere(): void {
		//????????????????????????
		var radius: number = Math.random() * 0.2 + 0.2;
		//????????????MeshSprite3D
		var sphere: MeshSprite3D = (<MeshSprite3D>this.scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(radius))));
		//????????????
		sphere.meshRenderer.material = this.mat2;
		var pos: Vector3 = sphere.transform.position;
		pos.setValue(Math.random() * 4 - 2, 10, Math.random() * 4 - 2);
		sphere.transform.position = pos;

		//?????????????????????
		var rigidBody: Rigidbody3D = sphere.addComponent(Rigidbody3D);
		//?????????????????????
		var sphereShape: SphereColliderShape = new SphereColliderShape(radius);
		//??????????????????????????????
		rigidBody.colliderShape = sphereShape;
		//?????????????????????
		rigidBody.mass = 10;
		rigidBody.collisionGroup = Physics3DUtils.COLLISIONFILTERGROUP_CUSTOMFILTER5;//????????????5
	}
}

