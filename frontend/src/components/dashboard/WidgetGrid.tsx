import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type Widget, useWidgetsStore } from "@/stores/widgetsStore";
import { WidgetCard } from "./WidgetCard";
import { WidgetRenderer } from "./WidgetRenderer";

// Stagger container — each child animates in sequence
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

// Each widget fades and rises into place
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
};

type WidgetGridProps = {
  widgets: Widget[];
  onConfigure: (widget: Widget) => void;
};

export function WidgetGrid({ widgets, onConfigure }: WidgetGridProps) {
  const { updateWidget } = useWidgetsStore();

  const [orderedIds, setOrderedIds] = useState<string[]>(() =>
    widgets.map((w) => w.id),
  );

  useEffect(() => {
    const incomingIds = widgets.map((w) => w.id);
    const added = incomingIds.some((id) => !orderedIds.includes(id));
    const removed = orderedIds.some((id) => !incomingIds.includes(id));
    if (added || removed) {
      setOrderedIds(incomingIds);
    }
  }, [widgets]);

  const orderedWidgets = orderedIds
    .map((id) => widgets.find((w) => w.id === id))
    .filter((w): w is Widget => !!w);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedIds.indexOf(active.id as string);
    const newIndex = orderedIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrderedIds = arrayMove(orderedIds, oldIndex, newIndex);
    setOrderedIds(newOrderedIds);

    try {
      await Promise.all(
        newOrderedIds.map((id, index) => updateWidget(id, { position: index })),
      );
    } catch {
      setOrderedIds(orderedIds);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={orderedIds} strategy={rectSortingStrategy}>
        <motion.div
          className="grid grid-cols-2 gap-4 p-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {orderedWidgets.map((widget) => (
            <SortableWidgetCard
              key={widget.id}
              widget={widget}
              onConfigure={onConfigure}
            />
          ))}
        </motion.div>
      </SortableContext>
    </DndContext>
  );
}

// ─── Sortable wrapper ─────────────────────────────────────────────────────────

type SortableWidgetCardProps = {
  widget: Widget;
  onConfigure: (widget: Widget) => void;
};

function SortableWidgetCard({ widget, onConfigure }: SortableWidgetCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    gridColumn: widget.config.size === "large" ? "span 2" : "span 1",
  };

  return (
    <motion.div ref={setNodeRef} style={style} variants={itemVariants}>
      <WidgetCard
        widget={widget}
        onConfigure={onConfigure}
        dragHandleProps={{ ...attributes, ...listeners }}
      >
        <WidgetRenderer widget={widget} />
      </WidgetCard>
    </motion.div>
  );
}
