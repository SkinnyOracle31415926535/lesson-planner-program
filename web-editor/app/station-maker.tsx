"use client";

import { useRef, useState } from "react";
import {
  stationEquipment,
  stationEquipmentCatalog,
  stationEquipmentHeight,
  stationEquipmentNeedingMeasurement,
  stationEquipmentFootprint,
  verifiedStationEquipment,
  type VerifiedStationEquipmentId,
} from "./station-equipment-catalog";
import {
  LEGACY_STATION_CANVAS,
  STATION_CANVAS,
  constrainStationObjectToCanvas,
  createStationAnnotation,
  createStationObject,
  isLegacyStationSetup,
  isStationSetupSaveable,
  snapStationCoordinate,
  stationAsset,
  stationObjectFootprint,
  type LegacyStationObject,
  type MeterStationObject,
  type MeterStationSetup,
  type StationSetup,
} from "./station-setups";

function meter(value: number): string {
  return `${value.toFixed(2).replace(/\.00$/, "")} m`;
}

function meterSize(width: number, height: number): string {
  return `${meter(width)} × ${meter(height)}`;
}

function meterObjectLayout(object: MeterStationObject): React.CSSProperties {
  const footprint = stationObjectFootprint(object);
  const physicalHeight = object.kind === "equipment"
    ? stationEquipmentHeight(object.equipmentId!).maximum
    : 0;
  const sideDepth = Math.max(4, Math.min(22, Math.round((physicalHeight + object.elevation) * 28) + 4));
  const stackRise = Math.min(22, Math.round(object.elevation * 24));
  return {
    left: `${object.x / STATION_CANVAS.width * 100}%`,
    top: `${object.y / STATION_CANVAS.height * 100}%`,
    width: `${footprint.width / STATION_CANVAS.width * 100}%`,
    height: `${footprint.height / STATION_CANVAS.height * 100}%`,
    transform: `translate(${-stackRise}px, ${-stackRise}px) rotate(${object.rotation}deg)`,
    zIndex: object.zIndex,
    "--station-side-depth": `${sideDepth}px`,
    "--station-stack-rise": `${stackRise}px`,
  } as React.CSSProperties;
}

function legacyObjectLayout(object: LegacyStationObject): React.CSSProperties {
  return {
    left: `${object.x / LEGACY_STATION_CANVAS.width * 100}%`,
    top: `${object.y / LEGACY_STATION_CANVAS.height * 100}%`,
    width: `${object.width / LEGACY_STATION_CANVAS.width * 100}%`,
    height: `${object.height / LEGACY_STATION_CANVAS.height * 100}%`,
    transform: `rotate(${object.rotation}deg)`,
    zIndex: object.zIndex,
  };
}

function LegacyObject({ object }: { object: LegacyStationObject }) {
  const layout = legacyObjectLayout(object);
  if (object.kind === "label") return <span aria-hidden="true" className="station-legacy-label" style={layout}>{object.text || "LABEL"}</span>;
  if (object.kind === "arrow") return <span aria-hidden="true" className="station-legacy-arrow" style={{ ...layout, fontSize: `${Math.max(16, Math.min(object.width, object.height))}px` }}>➜</span>;
  const asset = stationAsset(object.assetId!);
  return <span aria-hidden="true" className={`station-legacy-piece ${asset.id} ${object.color ?? "blue"}`} style={layout}><span>{asset.id === "beam" ? "" : asset.name}</span></span>;
}

function MeterObject({ object, selected, onSelect }: { object: MeterStationObject; selected?: boolean; onSelect?: (event: React.PointerEvent<HTMLButtonElement>) => void }) {
  const layout = meterObjectLayout(object);
  if (object.kind === "label") {
    const className = `station-scene-label${selected ? " selected" : ""}`;
    return onSelect
      ? <button type="button" className={className} aria-label="Station label" style={layout} onPointerDown={onSelect}>{object.text || "LABEL"}</button>
      : <span aria-hidden="true" className={className} style={layout}>{object.text || "LABEL"}</span>;
  }
  if (object.kind === "arrow") {
    const className = `station-scene-arrow${selected ? " selected" : ""}`;
    return onSelect
      ? <button type="button" className={className} aria-label="Direction arrow" style={layout} onPointerDown={onSelect}>➜</button>
      : <span aria-hidden="true" className={className} style={layout}>➜</span>;
  }
  const equipment = stationEquipment(object.equipmentId!);
  const className = `station-scene-piece station-profile-${equipment.profile}${selected ? " selected" : ""}`;
  const content = <><span className="station-scene-top">{equipment.name}</span><span className="station-scene-side" /></>;
  return onSelect
    ? <button type="button" className={className} aria-label={equipment.name} style={layout} onPointerDown={onSelect}>{content}</button>
    : <span aria-hidden="true" className={className} style={layout}>{content}</span>;
}

export function StationPreview({ setup, label }: { setup: StationSetup | null | undefined; label: string }) {
  if (!setup) return <div className="station-preview-empty">SCALED STATION<br />LOCAL PREVIEW</div>;
  if (isLegacyStationSetup(setup)) {
    return <div className="station-preview station-preview-legacy" aria-label={`Legacy pixel station preview for ${label}; not to scale`}>
      <span className="station-preview-status">LEGACY · NOT TO SCALE</span>
      {setup.objects.slice().sort((a, b) => a.zIndex - b.zIndex).map((object) => <LegacyObject key={object.id} object={object} />)}
    </div>;
  }
  return <div className="station-preview station-preview-metric" aria-label={`Meter-scale 2.5D station preview for ${label}`}>
    <span className="station-preview-status">1 UNIT = 1 M</span>
    {setup.objects.slice().sort((a, b) => a.zIndex - b.zIndex).map((object) => <MeterObject key={object.id} object={object} />)}
  </div>;
}

type Drag = { id: string; pointerId: number; startX: number; startY: number; objectX: number; objectY: number };

function LegacyStationDialog({ setup, onCancel }: { setup: StationSetup; onCancel: () => void }) {
  return <div className="station-maker-scrim" role="presentation">
    <section className="station-maker station-maker-legacy retro-window" role="dialog" aria-modal="true" aria-label="Legacy station layout">
      <div className="window-title"><b>LEGACY STATION</b><span>V1 PIXEL LAYOUT · PRESERVED AS-IS</span><button type="button" onClick={onCancel} aria-label="Close legacy station">×</button></div>
      <div className="station-legacy-dialog-body">
        <StationPreview setup={setup} label="Legacy station" />
        <p><b>NOT TO SCALE.</b> This saved v1 layout uses pixel coordinates and has no verified meter conversion. It is preserved exactly, rather than being silently remapped into the 2.5D scene.</p>
        <p>To use a true-scale setup, make a new station with equipment whose measurements have been verified.</p>
      </div>
      <footer className="station-maker-actions"><span>LEGACY LAYOUT KEPT SAFE</span><div><button type="button" onClick={onCancel}>CLOSE</button></div></footer>
    </section>
  </div>;
}

function ScaledStationMakerDialog({ setup, onSave, onCancel }: { setup: MeterStationSetup; onSave: (setup: StationSetup) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<MeterStationSetup>(setup);
  const [selectedId, setSelectedId] = useState<string | null>(draft.objects.at(-1)?.id ?? null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const selected = draft.objects.find((object) => object.id === selectedId) ?? null;

  const revise = (change: (current: MeterStationSetup) => MeterStationSetup) => setDraft((current) => ({ ...change(current), updatedAt: new Date().toISOString() }));
  const addEquipment = (equipmentId: VerifiedStationEquipmentId) => revise((current) => {
    const object = createStationObject(equipmentId, Math.max(0, ...current.objects.map((item) => item.zIndex)) + 1);
    setSelectedId(object.id);
    return { ...current, objects: [...current.objects, object] };
  });
  const addAnnotation = (kind: "label" | "arrow") => revise((current) => {
    const object = createStationAnnotation(kind, Math.max(0, ...current.objects.map((item) => item.zIndex)) + 1);
    setSelectedId(object.id);
    return { ...current, objects: [...current.objects, object] };
  });
  const patchSelected = (patch: Partial<MeterStationObject>) => selected && revise((current) => ({
    ...current,
    objects: current.objects.map((object) => object.id === selected.id ? constrainStationObjectToCanvas({ ...object, ...patch }) : object),
  }));
  const removeSelected = () => selected && revise((current) => {
    setSelectedId(null);
    return { ...current, objects: current.objects.filter((object) => object.id !== selected.id) };
  });

  const beginDrag = (event: React.PointerEvent<HTMLButtonElement>, object: MeterStationObject) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(object.id);
    dragRef.current = { id: object.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, objectX: object.x, objectY: object.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const drag = (event: React.PointerEvent<HTMLDivElement>) => {
    const active = dragRef.current;
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!active || active.pointerId !== event.pointerId || !bounds) return;
    const x = snapStationCoordinate(active.objectX + (event.clientX - active.startX) / bounds.width * STATION_CANVAS.width);
    const y = snapStationCoordinate(active.objectY + (event.clientY - active.startY) / bounds.height * STATION_CANVAS.height);
    revise((current) => ({
      ...current,
      objects: current.objects.map((object) => object.id === active.id ? constrainStationObjectToCanvas({ ...object, x, y }) : object),
    }));
  };

  const canSave = isStationSetupSaveable(draft);
  const selectedEquipment = selected?.kind === "equipment" ? stationEquipment(selected.equipmentId!) : null;
  const selectedFootprint = selected ? stationObjectFootprint(selected) : null;

  return <div className="station-maker-scrim" role="presentation">
    <section className="station-maker retro-window" role="dialog" aria-modal="true" aria-label="Make scaled station">
      <div className="window-title"><b>MAKE STATION</b><span>SCALED 2.5D SCENE · 1 UNIT = 1 METER</span><button type="button" onClick={onCancel} aria-label="Close station maker">×</button></div>
      <div className="station-maker-body">
        <aside className="station-palette" aria-label="Equipment catalog">
          <b>VERIFIED SCALE · {verifiedStationEquipment.length}</b>
          <span className="station-palette-help">Only measured equipment can enter the meter scene.</span>
          {stationEquipmentCatalog.map((item) => {
            const placeable = item.measurementStatus === "verified";
            return <button key={item.id} type="button" disabled={!placeable} className={placeable ? "station-palette-item" : "station-palette-item needs-measurement"} onClick={() => { if (placeable) addEquipment(item.id as VerifiedStationEquipmentId); }}>
              <i className={`station-palette-icon station-profile-${item.profile}`} />
              <span>{item.name}<small>{placeable ? `${meterSize(stationEquipmentFootprint(item.id as VerifiedStationEquipmentId).length, stationEquipmentFootprint(item.id as VerifiedStationEquipmentId).width)} · VERIFIED` : "NEEDS MEASUREMENT"}</small></span>
            </button>;
          })}
          <span className="station-palette-count">{stationEquipmentNeedingMeasurement.length} KNOWN ITEMS WAITING FOR DIMENSIONS</span>
          <hr />
          <button type="button" onClick={() => addAnnotation("label")}>+ TEXT LABEL</button>
          <button type="button" onClick={() => addAnnotation("arrow")}>+ ARROW</button>
        </aside>
        <div className="station-maker-center">
          <div className="station-scene-ruler station-scene-ruler-top" aria-hidden="true"><span>0 m</span><span>3 m</span><span>6 m</span><span>9 m</span><span>12 m</span></div>
          <div ref={canvasRef} className="station-canvas station-canvas-metric" onPointerMove={drag} onPointerUp={() => { dragRef.current = null; }} onPointerCancel={() => { dragRef.current = null; }}>
            {draft.objects.slice().sort((a, b) => a.zIndex - b.zIndex).map((object) => <MeterObject key={object.id} object={object} selected={selectedId === object.id} onSelect={(event) => beginDrag(event, object)} />)}
            {!draft.objects.length ? <span className="station-canvas-hint">PICK A VERIFIED ITEM, THEN DRAG IT INTO PLACE</span> : null}
          </div>
          <div className="station-scene-ruler station-scene-ruler-bottom" aria-hidden="true"><span>0 m</span><span>2 m</span><span>4 m</span><span>6 m</span><span>8 m</span></div>
          <p>12 m × 8 m · 0.25 m GRID · VISUAL STACKING ONLY — CHECK CLEARANCE AND SUPPORT IN THE GYM</p>
        </div>
        <aside className="station-inspector">
          <b>SELECTED OBJECT</b>
          {selected ? <>
            <strong>{selectedEquipment?.name ?? selected.kind.toUpperCase()}</strong>
            {selectedEquipment && selectedFootprint ? <div className="station-inspector-facts"><span>FOOTPRINT {meterSize(selectedFootprint.width, selectedFootprint.height)}</span><span>HEIGHT {meter(stationEquipmentHeight(selected.equipmentId!).minimum)}–{meter(stationEquipmentHeight(selected.equipmentId!).maximum)}</span><span>CATALOG MEASURED</span></div> : null}
            {selected.kind === "label" ? <label>TEXT<input value={selected.text ?? ""} maxLength={40} onChange={(event) => patchSelected({ text: event.target.value })} /></label> : null}
            {selected.kind !== "equipment" && selectedFootprint ? <div className="station-inspector-facts"><span>ANNOTATION SIZE {meterSize(selectedFootprint.width, selectedFootprint.height)}</span></div> : null}
            <div className="station-inspector-row"><button type="button" onClick={() => patchSelected({ rotation: (selected.rotation - 15 + 360) % 360 })}>↶ ROTATE</button><button type="button" onClick={() => patchSelected({ rotation: (selected.rotation + 15) % 360 })}>ROTATE ↷</button></div>
            {selected.kind !== "equipment" ? <div className="station-inspector-row"><button type="button" onClick={() => patchSelected({ width: Math.max(STATION_CANVAS.grid, (selected.width ?? 1) - STATION_CANVAS.grid), height: Math.max(STATION_CANVAS.grid, (selected.height ?? 1) - STATION_CANVAS.grid) })}>− SIZE</button><button type="button" onClick={() => patchSelected({ width: Math.min(STATION_CANVAS.width, (selected.width ?? 1) + STATION_CANVAS.grid), height: Math.min(STATION_CANVAS.height, (selected.height ?? 1) + STATION_CANVAS.grid) })}>+ SIZE</button></div> : null}
            <div className="station-inspector-row"><button type="button" onClick={() => patchSelected({ elevation: Math.max(0, Number((selected.elevation - 0.1).toFixed(2))) })}>LOWER</button><button type="button" onClick={() => patchSelected({ elevation: Number((selected.elevation + 0.1).toFixed(2)) })}>RAISE</button></div>
            <div className="station-inspector-facts"><span>VISUAL ELEVATION {meter(selected.elevation)}</span><span>NO COLLISION / SUPPORT PHYSICS</span></div>
            <div className="station-inspector-row"><button type="button" onClick={() => patchSelected({ zIndex: Math.max(0, selected.zIndex - 1) })}>SEND BACK</button><button type="button" onClick={() => patchSelected({ zIndex: Math.max(...draft.objects.map((object) => object.zIndex)) + 1 })}>BRING FRONT</button></div>
            <button type="button" onClick={removeSelected} className="station-delete">DELETE OBJECT</button>
          </> : <span>SELECT AN OBJECT TO EDIT IT</span>}
        </aside>
      </div>
      <footer className="station-maker-actions"><span>{canSave ? `${draft.objects.length} OBJECT${draft.objects.length === 1 ? "" : "S"} · METER-SCALE SCENE` : "ADD A VERIFIED ITEM OR ANNOTATION TO ENABLE SAVE"}</span><div><button type="button" onClick={onCancel}>CANCEL</button><button type="button" className="station-save" disabled={!canSave} onClick={() => { if (canSave) onSave(draft); }}>SAVE STATION</button></div></footer>
    </section>
  </div>;
}

export function StationMakerDialog({ setup, onSave, onCancel }: { setup: StationSetup; onSave: (setup: StationSetup) => void; onCancel: () => void }) {
  if (isLegacyStationSetup(setup)) return <LegacyStationDialog setup={setup} onCancel={onCancel} />;
  return <ScaledStationMakerDialog setup={setup} onSave={onSave} onCancel={onCancel} />;
}
