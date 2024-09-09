import React, { useState } from 'react';
import Draggable from 'react-draggable';
import './myEditor.css';
import logo from '../Assets/logo.png';

const MyEditor = () => {
    const [textBoxes, setTextBoxes] = useState([]);
    const [nextId, setNextId] = useState(0);
    const [selectedBoxId, setSelectedBoxId] = useState(null);
    const [fontSize, setFontSize] = useState(16);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [draggingDisabled, setDraggingDisabled] = useState(false);

    const [undoStack, setUndoStack] = useState([]);
    const [redoStack, setRedoStack] = useState([]);

    const fontFamilies = ['Arial', 'Verdana', 'Courier New', 'Times New Roman', 'Georgia'];

    const addToUndoStack = () => {
        setUndoStack([...undoStack, textBoxes]);
        setRedoStack([]);
    };

    const addTextBox = () => {
        addToUndoStack();
        setTextBoxes([
            ...textBoxes,
            {
                id: `tb_${nextId}`,
                x: 0,
                y: 50,
                text: '',
                width: '150px',
                height: '50px',
                style: {
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    textDecoration: 'none',
                    textAlign: 'left',
                    fontSize: fontSize,
                    fontFamily: fontFamily,
                    backgroundColor: 'transparent',
                },
            },
        ]);
        setNextId(nextId + 1);
    };

    const handleTextChange = (id, event) => {
        addToUndoStack();
        const newTextBoxes = textBoxes.map((box) => {
            if (box.id === id) {
                const text = event.target.value;
                return { ...box, text };
            }
            return box;
        });
        setTextBoxes(newTextBoxes);
    };

    const handleDrag = (id, e, data) => {
        addToUndoStack();
        const newTextBoxes = textBoxes.map((box) =>
            box.id === id ? { ...box, x: data.x, y: data.y } : box
        );
        setTextBoxes(newTextBoxes);
    };

    const deleteTextBox = (id) => {
        addToUndoStack();
        setTextBoxes(textBoxes.filter((box) => box.id !== id));
    };

    const handleBoxClick = (id) => {
        setSelectedBoxId(id);
    };

    const applyStyle = (styleType) => {
        if (selectedBoxId) {
            addToUndoStack();
            const newTextBoxes = textBoxes.map((box) => {
                if (box.id === selectedBoxId) {
                    let newStyle = { ...box.style };
                    switch (styleType) {
                        case 'bold':
                            newStyle.fontWeight =
                                newStyle.fontWeight === 'bold' ? 'normal' : 'bold';
                            break;
                        case 'italic':
                            newStyle.fontStyle =
                                newStyle.fontStyle === 'italic' ? 'normal' : 'italic';
                            break;
                        case 'underline':
                            newStyle.textDecoration =
                                newStyle.textDecoration === 'underline' ? 'none' : 'underline';
                            break;
                        case 'align':
                            const alignments = ['left', 'center', 'right', 'justify'];
                            const currentAlignment = newStyle.textAlign || 'left';
                            const nextAlignment =
                                alignments[(alignments.indexOf(currentAlignment) + 1) % alignments.length];
                            newStyle.textAlign = nextAlignment;
                            break;
                        default:
                            break;
                    }
                    return { ...box, style: newStyle };
                }
                return box;
            });
            setTextBoxes(newTextBoxes);
        }
    };

    const handleFontFamilyChange = (event) => {
        const selectedFontFamily = event.target.value;
        setFontFamily(selectedFontFamily);

        if (selectedBoxId) {
            addToUndoStack();
            const newTextBoxes = textBoxes.map((box) =>
                box.id === selectedBoxId
                    ? { ...box, style: { ...box.style, fontFamily: selectedFontFamily } }
                    : box
            );
            setTextBoxes(newTextBoxes);
        }
    };

    const handleDecrement = () => {
        const newFontSize = Math.max(fontSize - 1, 1);
        setFontSize(newFontSize);
        if (selectedBoxId) {
            addToUndoStack();
            const newTextBoxes = textBoxes.map((box) =>
                box.id === selectedBoxId
                    ? { ...box, style: { ...box.style, fontSize: newFontSize } }
                    : box
            );
            setTextBoxes(newTextBoxes);
        }
    };

    const handleIncrement = () => {
        const newFontSize = fontSize + 1;
        setFontSize(newFontSize);
        if (selectedBoxId) {
            addToUndoStack();
            const newTextBoxes = textBoxes.map((box) =>
                box.id === selectedBoxId
                    ? { ...box, style: { ...box.style, fontSize: newFontSize } }
                    : box
            );
            setTextBoxes(newTextBoxes);
        }
    };

    // Undo functionality
    const handleUndo = () => {
        if (undoStack.length > 0) {
            const previousState = undoStack.pop();
            setRedoStack([...redoStack, textBoxes]);
            setTextBoxes(previousState);
        }
    };

    const handleRedo = () => {
        if (redoStack.length > 0) {
            const nextState = redoStack.pop();
            setUndoStack([...undoStack, textBoxes]);
            setTextBoxes(nextState);
        }
    };

    const getSelectedBoxAlignment = () => {
        if (selectedBoxId) {
            const selectedBox = textBoxes.find((box) => box.id === selectedBoxId);
            if (selectedBox) {
                return selectedBox.style.textAlign || 'left';
            }
        }
        return 'left';
    };

    return (
        <>
            <nav className='Navbar'>
                <div className='logo'>
                    <img className='logoImage' src={logo} alt='Celebrare' />
                    <p className='logoText'>Celebrare</p>
                </div>

                <div className='undoRedo'>
                    <button className='undoButton' onClick={handleUndo}>
                        <i style={{ color: '#000000' }} className='fa-solid fa-rotate-left'></i>
                        Undo
                    </button>
                    <button className='redoButton' onClick={handleRedo}>
                        <i style={{ color: '#000000' }} className='fa-solid fa-rotate-right'></i>
                        Redo
                    </button>
                </div>
            </nav>

            <main className='MyEditor'>
                <section className='content'>
                    {textBoxes.map((box) => (
                        <Draggable
                            key={box.id}
                            position={{ x: box.x, y: box.y }}
                            onStop={(e, data) => handleDrag(box.id, e, data)}
                            bounds='parent'
                            disabled={draggingDisabled}
                            handle='.drag-handle'
                        >
                            <div
                                className='textBox'
                                onClick={() => handleBoxClick(box.id)}
                            >
                                <textarea
                                    value={box.text}
                                    onChange={(e) => handleTextChange(box.id, e)}
                                    placeholder='Type here...'
                                    className='textArea'
                                    style={{ ...box.style, width: box.width, height: box.height }}
                                    onMouseDown={() => setDraggingDisabled(true)}
                                    onMouseUp={() => setDraggingDisabled(false)}
                                />
                                <div className='textBoxControls'>
                                    <button
                                        className='deleteButton'
                                        onClick={() => deleteTextBox(box.id)}
                                    >
                                        <i className='fas fa-trash-alt'></i>
                                    </button>
                                    <i
                                        className='fa-solid fa-up-down-left-right drag-handle'
                                        style={{ cursor: 'move' }}
                                    ></i>
                                </div>
                            </div>
                        </Draggable>
                    ))}
                </section>

                <section className='toolbar'>
                    <select
                        className='style fontStyle'
                        id='fontFamily'
                        value={fontFamily}
                        onChange={handleFontFamilyChange}
                    >
                        {fontFamilies.map((font, index) => (
                            <option key={index} value={font}>
                                {font}
                            </option>
                        ))}
                    </select>

                    <div className='style'>
                        <button className='handleNumber' onClick={handleDecrement}>
                            -
                        </button>
                        <span style={{ margin: '0 10px' }}>{fontSize}</span>
                        <button className='handleNumber' onClick={handleIncrement}>
                            +
                        </button>
                    </div>

                    <div className='styling'>
                        <button onClick={() => applyStyle('bold')}>
                            <i className='fa-solid fa-bold'></i>
                        </button>
                        <button onClick={() => applyStyle('italic')}>
                            <i className='fa-solid fa-italic'></i>
                        </button>
                        <button onClick={() => applyStyle('underline')}>
                            <i className='fa-solid fa-underline'></i>
                        </button>
                        <button onClick={() => applyStyle('align')}>
                            <i className={`fa-solid fa-align-${getSelectedBoxAlignment()}`}></i>
                        </button>
                    </div>
                </section>
                <div className='textAdder'>
                    <button onClick={addTextBox} className='addTextButton'>
                        Add Text
                    </button>
                </div>
            </main>
        </>
    );
};

export default MyEditor;
