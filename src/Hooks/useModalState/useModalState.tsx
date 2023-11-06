import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/naming-convention
type TUseModal<T> = { onOpen: () => void; onClose: () => void; isOpen: boolean; onToggle: () => void; setActive: (item: T) => void; activeItem: T | undefined };

// eslint-disable-next-line @typescript-eslint/naming-convention
export const useModalState = <T extends unknown>(initialOpen = false): TUseModal<T> => {
	const [isOpen, setIsOpen] = useState(initialOpen);
	const [activeItem, setActiveItem] = useState<T>();

	const onOpen = () => {
		setIsOpen(true);
	};

	const onClose = () => {
		setActiveItem(undefined);
		setIsOpen(false);
	};

	const onToggle = () => {
		setIsOpen(!isOpen);
	};

	const setActive = (item: T) => {
		setActiveItem(item);
		setIsOpen(true);
	};

	return { onOpen, onClose, isOpen, onToggle, setActive, activeItem };
};
