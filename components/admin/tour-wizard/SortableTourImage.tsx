import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Image as ImageIcon, GripVertical } from 'lucide-react';
import { cn } from '@/libs/utils';

interface SortableTourImageProps {
    id: string;
    image: {
        image_url: string;
        is_cover: boolean;
        file?: File;
    };
    onRemove: () => void;
}

const SortableTourImage: React.FC<SortableTourImageProps> = ({ id, image, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl transition-all duration-300",
                isDragging ? "opacity-30 scale-95 shadow-none" : "hover:shadow-primary/5 hover:border-primary/20"
            )}
        >
            <img
                src={image.image_url}
                alt="Tour"
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-between items-start">
                    <div className="px-2 py-1 rounded bg-white/10 backdrop-blur-md text-[9px] font-bold uppercase tracking-wider border border-white/20 text-white">
                        {image.file ? 'Chờ upload' : 'Đã upload'}
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors shadow-lg"
                    >
                        <ImageIcon className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div
                    {...attributes}
                    {...listeners}
                    className="flex justify-center cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded transition-colors"
                >
                    <GripVertical className="h-5 w-5 text-white/50" />
                </div>
            </div>

            {image.is_cover && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-[10px] font-bold uppercase shadow-lg text-white">
                    Ảnh bìa
                </div>
            )}
        </div>
    );
};

export default SortableTourImage;
