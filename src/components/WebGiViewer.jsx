import React from 'react'
import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { ViewerApp, AssetManagerPlugin, GBufferPlugin, ProgressivePlugin, TonemapPlugin, SSRPlugin, SSAOPlugin, BloomPlugin, GammaCorrectionPlugin, addBasePlugins, mobileAndTabletCheck } from 'webgi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollAnimation } from '../lib/scrollAmination';

gsap.registerPlugin(ScrollTrigger);


const WebGiViewer = forwardRef((props, ref) => {
    const [viewerRef, setViewerRef] = useState(null)
    const [targetRef, setTargetRef] = useState(null)
    const [cameraRef, setCameraRef] = useState(null)
    const [positionRef, setPositionRef] = useState(null)
    const [previewMode, setPreviewMode] = useState(false);
    const canvasRef = useRef(null);
    const canvasContainerRef = useRef(null);
    useImperativeHandle(ref, () => ({
        triggerPreview() {
            setPreviewMode(true);
            canvasContainerRef.current.style.pointerEvents = "all";
            props.contentRef.current.style.opacity = 0;
            gsap.to(positionRef, {
                x: 13.04,
                y: -2.01,
                z: 2.29,
                duration: 2,
                onUpdate: () => {
                    viewerRef.setDirty();
                    cameraRef.positionTargetUpdated(true);
                }
            });
            gsap.to(targetRef, {
                x: 0.11,
                y: 0.0,
                z: 0.0,
                duration: 2,
            })
            viewerRef.scene.activeCamera.setCameraOptions({ controlsEnabled: true })

        }
    }))
    const handleExit = () => {
        setPreviewMode(false);
        canvasContainerRef.current.style.pointerEvents = "none";
        props.contentRef.current.style.opacity = 1;
        gsap.to(positionRef, {
            x: 1.56,
            y: 5.0,
            z: 0.01,
            duration: 1,
            onUpdate: () => {
                viewerRef.setDirty();
                cameraRef.positionTargetUpdated(true);
            }
        });
        gsap.to(targetRef, {
            x: -0.55,
            y: 0.32,
            z: 0,
            duration: 1,
        })
        viewerRef.scene.activeCamera.setCameraOptions({ controlsEnabled: false })
    }

    const memoizedScrollAnim = useCallback(
        (position, target, onUpdate) => {
            if (position && target && onUpdate) {
                scrollAnimation(position, target, onUpdate);
            }
        }, []
    )
    const setupViewer = useCallback(
        async () => {
            const viewer = new ViewerApp({
                canvas: canvasRef.current,
            })
            setViewerRef(viewer);

            // Add some plugins
            const manager = await viewer.addPlugin(AssetManagerPlugin);

            const camera = viewer.scene.activeCamera;
            setCameraRef(camera);
            const position = camera.position;
            setPositionRef(position);
            const target = camera.target;
            setTargetRef(target);

            await viewer.addPlugin(GBufferPlugin);
            await viewer.addPlugin(new ProgressivePlugin(32));
            await viewer.addPlugin(new TonemapPlugin(true));
            await viewer.addPlugin(GammaCorrectionPlugin);
            await viewer.addPlugin(SSRPlugin);
            await viewer.addPlugin(SSAOPlugin);
            await viewer.addPlugin(BloomPlugin);

            // This must be called once after all plugins are added.
            viewer.renderer.refreshPipeline();

            await manager.addFromPath("scene-black.glb");

            viewer.getPlugin(TonemapPlugin).config.clipBackground = true;

            viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: false })

            window.scrollTo(0, 0);

            let needUpdate = true;

            const onUpdate = () => {
                needUpdate = true;
                viewer.setDirty();
            }

            viewer.addEventListener("preFrame", () => {
                if (needUpdate) {
                    camera.positionTargetUpdated(true);
                    needUpdate = false;
                }
            });

            memoizedScrollAnim(position, target, onUpdate);

        }, []
    );

    useEffect(() => {
        setupViewer();
    }, []);

    return (
        <div ref={canvasContainerRef} id='webgi-canvas-container'>
            <canvas id='webgi-canvas' ref={canvasRef}></canvas>
            {previewMode && <button className="button" onClick={handleExit}>Exit</button>}
        </div>
    )
})

export default WebGiViewer;
