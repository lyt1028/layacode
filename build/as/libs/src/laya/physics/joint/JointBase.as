package laya.physics.joint {
	import laya.components.Component;

	/**
	 * 关节基类
	 */
	public class JointBase extends Component {

		/**
		 * 原生关节对象
		 */
		protected var _joint:*;

		/**
		 * [只读]原生关节对象
		 */
		public function get joint():*{return null;}
		protected function _createJoint():void{}

		/**
		 * 获取是否为单实例组件。
		 * @override 
		 */
		override public function get isSingleton():Boolean{return null;}
	}

}
