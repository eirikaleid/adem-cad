import { useEffect } from 'react';
import * as THREE from 'three';
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _ray = new THREE.Raycaster();
function getGroundPoint(mouseNdc, camera) {
    _ray.setFromCamera(mouseNdc, camera);
    const hit = new THREE.Vector3();
    return _ray.ray.intersectPlane(_ground, hit) ? hit : null;
}
export function useOrbitControls(cameraRef, canvasRef) {
    useEffect(() => {
        const canvas = canvasRef.current;
        const camera = cameraRef.current;
        if (!canvas || !camera)
            return;
        const s = {
            isOrbiting: false, isPanning: false, lastX: 0, lastY: 0,
            spherical: { theta: Math.PI / 4, phi: Math.PI / 3.5, radius: 10 },
            target: new THREE.Vector3(0, 0, 0), targetRadius: 10,
            orbitVelTheta: 0, orbitVelPhi: 0, panVelX: 0, panVelY: 0,
            snapActive: false,
            snapFrom: { theta: 0, phi: 0, radius: 10, target: new THREE.Vector3() },
            snapTo: { theta: 0, phi: 0, radius: 10, target: new THREE.Vector3() },
            snapT: 0, lastClickTime: 0, lastClickX: 0, lastClickY: 0,
        };
        const applySpherical = () => {
            const { theta, phi, radius } = s.spherical;
            camera.position.set(s.target.x + radius * Math.sin(phi) * Math.sin(theta), s.target.y + radius * Math.cos(phi), s.target.z + radius * Math.sin(phi) * Math.cos(theta));
            camera.lookAt(s.target);
        };
        applySpherical();
        // Single RAF loop: smooth zoom + inertia + snap lerp
        let rafId = 0;
        const tick = () => {
            rafId = requestAnimationFrame(tick);
            let dirty = false;
            const zoomDiff = s.targetRadius - s.spherical.radius;
            if (Math.abs(zoomDiff) > 0.001) {
                s.spherical.radius += zoomDiff * 0.18;
                dirty = true;
            }
            else {
                s.spherical.radius = s.targetRadius;
            }
            if (!s.isOrbiting && (Math.abs(s.orbitVelTheta) > 0.00001 || Math.abs(s.orbitVelPhi) > 0.00001)) {
                s.spherical.theta += s.orbitVelTheta;
                s.spherical.phi = Math.max(0.02, Math.min(Math.PI - 0.02, s.spherical.phi + s.orbitVelPhi));
                s.orbitVelTheta *= 0.88;
                s.orbitVelPhi *= 0.88;
                dirty = true;
            }
            if (!s.isPanning && (Math.abs(s.panVelX) > 0.00001 || Math.abs(s.panVelY) > 0.00001)) {
                camera.getWorldDirection(_dir);
                _right.crossVectors(_dir, camera.up).normalize();
                _up.crossVectors(_right, _dir).normalize();
                s.target.addScaledVector(_right, -s.panVelX);
                s.target.addScaledVector(_up, s.panVelY);
                s.panVelX *= 0.88;
                s.panVelY *= 0.88;
                dirty = true;
            }
            if (s.snapActive) {
                s.snapT = Math.min(1, s.snapT + 0.08);
                const t = 1 - Math.pow(1 - s.snapT, 3);
                s.spherical.theta = s.snapFrom.theta + (s.snapTo.theta - s.snapFrom.theta) * t;
                s.spherical.phi = s.snapFrom.phi + (s.snapTo.phi - s.snapFrom.phi) * t;
                s.spherical.radius = s.snapFrom.radius + (s.snapTo.radius - s.snapFrom.radius) * t;
                s.target.lerpVectors(s.snapFrom.target, s.snapTo.target, t);
                s.targetRadius = s.spherical.radius;
                if (s.snapT >= 1) {
                    s.snapActive = false;
                    s.spherical.theta = s.snapTo.theta;
                    s.spherical.phi = s.snapTo.phi;
                    s.spherical.radius = s.snapTo.radius;
                    s.target.copy(s.snapTo.target);
                }
                dirty = true;
            }
            if (dirty)
                applySpherical();
        };
        tick();
        const syncSpherical = () => {
            const dx = camera.position.x - s.target.x;
            const dy = camera.position.y - s.target.y;
            const dz = camera.position.z - s.target.z;
            s.spherical.radius = Math.sqrt(dx * dx + dy * dy + dz * dz);
            s.spherical.phi = Math.acos(Math.max(-1, Math.min(1, dy / s.spherical.radius)));
            s.spherical.theta = Math.atan2(dx, dz);
            s.targetRadius = s.spherical.radius;
        };
        const startSnap = (toTheta, toPhi, toRadius) => {
            s.orbitVelTheta = 0;
            s.orbitVelPhi = 0;
            s.snapFrom = { theta: s.spherical.theta, phi: s.spherical.phi, radius: s.spherical.radius, target: s.target.clone() };
            s.snapTo = { theta: toTheta, phi: toPhi, radius: toRadius ?? s.spherical.radius, target: new THREE.Vector3(0, 0, 0) };
            s.snapT = 0;
            s.snapActive = true;
        };
        const onMouseDown = (e) => {
            if (e.button === 1) {
                s.isOrbiting = true;
                s.orbitVelTheta = 0;
                s.orbitVelPhi = 0;
                e.preventDefault();
            }
            if (e.button === 2) {
                s.isPanning = true;
                s.panVelX = 0;
                s.panVelY = 0;
                e.preventDefault();
            }
            s.lastX = e.clientX;
            s.lastY = e.clientY;
            // Double-click: reset view
            if (e.button === 0) {
                const now = Date.now();
                const dist = Math.hypot(e.clientX - s.lastClickX, e.clientY - s.lastClickY);
                if (now - s.lastClickTime < 300 && dist < 8) {
                    s.target.set(0, 0, 0);
                    startSnap(Math.PI / 4, Math.PI / 3.5, 10);
                }
                s.lastClickTime = now;
                s.lastClickX = e.clientX;
                s.lastClickY = e.clientY;
            }
        };
        const onMouseMove = (e) => {
            const dx = e.clientX - s.lastX;
            const dy = e.clientY - s.lastY;
            s.lastX = e.clientX;
            s.lastY = e.clientY;
            if (s.isOrbiting) {
                const dTheta = -dx * 0.006;
                const dPhi = -dy * 0.006;
                s.spherical.theta += dTheta;
                s.spherical.phi = Math.max(0.02, Math.min(Math.PI - 0.02, s.spherical.phi + dPhi));
                s.orbitVelTheta = dTheta;
                s.orbitVelPhi = dPhi;
                s.snapActive = false;
            }
            if (s.isPanning) {
                const panSpeed = s.spherical.radius * 0.0012;
                camera.getWorldDirection(_dir);
                _right.crossVectors(_dir, camera.up).normalize();
                _up.crossVectors(_right, _dir).normalize();
                const velX = -dx * panSpeed;
                const velY = dy * panSpeed;
                s.target.addScaledVector(_right, velX);
                s.target.addScaledVector(_up, velY);
                s.panVelX = velX;
                s.panVelY = velY;
                s.snapActive = false;
            }
        };
        const onMouseUp = (e) => {
            if (e.button === 1)
                s.isOrbiting = false;
            if (e.button === 2)
                s.isPanning = false;
        };
        const onWheel = (e) => {
            // Normalize across deltaMode (trackpad=LINE, mouse=PIXEL)
            let delta = e.deltaY;
            if (e.deltaMode === 1)
                delta *= 16;
            if (e.deltaMode === 2)
                delta *= 400;
            const factor = e.shiftKey ? 0.003 : 0.0012;
            const zoomFactor = delta * factor;
            // Zoom-to-cursor: pull target toward ground hit under cursor
            const rect = canvas.getBoundingClientRect();
            const mouseNdc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
            const hitPoint = getGroundPoint(mouseNdc, camera);
            if (hitPoint && zoomFactor < 0) {
                const pull = Math.min(0.3, Math.abs(zoomFactor) * 2);
                s.target.lerp(hitPoint, pull);
                syncSpherical();
            }
            s.targetRadius = Math.max(0.1, Math.min(1000, s.targetRadius * (1 + zoomFactor)));
            s.snapActive = false;
            e.preventDefault();
        };
        const onContextMenu = (e) => e.preventDefault();
        const onKeyDown = (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
                return;
            switch (e.key) {
                case 'f':
                case 'F':
                    s.target.set(0, 0, 0);
                    startSnap(Math.PI / 4, Math.PI / 3.5, 10);
                    break;
                case '1':
                    startSnap(0, Math.PI / 2);
                    break;
                case '3':
                    startSnap(Math.PI / 2, Math.PI / 2);
                    break;
                case '7':
                    startSnap(Math.PI / 4, 0.01);
                    break;
                case '5':
                    startSnap(Math.PI, Math.PI / 2);
                    break;
            }
        };
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('contextmenu', onContextMenu);
        canvas.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        window.addEventListener('keydown', onKeyDown);
        return () => {
            cancelAnimationFrame(rafId);
            canvas.removeEventListener('mousedown', onMouseDown);
            canvas.removeEventListener('contextmenu', onContextMenu);
            canvas.removeEventListener('wheel', onWheel);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [cameraRef, canvasRef]);
}
