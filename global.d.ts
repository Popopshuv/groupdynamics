import { Object3DNode } from "@react-three/fiber";
import { Text as TroikaText } from "troika-three-text";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      troikaText: Object3DNode<TroikaText, typeof TroikaText>;
    }
  }
}

declare module "troika-three-text";
