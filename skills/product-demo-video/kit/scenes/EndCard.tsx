import { Video } from "@remotion/media";
import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { ramp } from "../theme";

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: ramp(frame, 0, 20) }}>
      <Video src={staticFile("brand/endcard.mp4")} muted objectFit="cover" />
    </AbsoluteFill>
  );
};
