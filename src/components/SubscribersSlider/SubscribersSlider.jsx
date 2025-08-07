import { useEffect, useState, useRef } from 'react';
import './SubscribersSlider.scss';
import PropTypes from 'prop-types';

const SubscriberSlider = ({ min, max, step, onChange, defaultValue, staticTooltip, allowedValues }) => {
    const [value, setValue] = useState(defaultValue);
    const [tooltipLeft, setTooltipLeft] = useState(0);
    const [showTooltip, setShowTooltip] = useState(true);
    const rangeRef = useRef(null);
    const tooltipRef = useRef(null);
    const thumbWidth = 20;

    const findNearest = (val, values) => {
        return values.reduce((prev, curr) => 
            Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
        );
    };

    const handleChange = (e) => {
        const nearestValue = findNearest(Number(e.target.value), allowedValues);
        setValue(nearestValue);
        onChange(nearestValue);
    };

    const formatNum = (num) => {
		if (num < 1000) {
			return num
		}
		if (num < 1000000) {
			return (num / 1000).toFixed(1) + 'k'
		}
		if (num < 1000000000) {
			return (num / 1000000).toFixed(1) + 'M'
		}
		if (num < 1000000000000) {
			return (num / 1000000000).toFixed(1) + 'B'
		}
		return (num / 1000000000000).toFixed(1) + 'T'
	}

    useEffect(() => {
        const range = rangeRef.current;
        if (range) {
            const left = ((value - min) / (max - min)) * (range.clientWidth - thumbWidth) + thumbWidth / 2;
            setTooltipLeft(left);
        }
    }, [value, min, max]);

    return (
        <div className="slider-container-component">
            <div className="slider-values">
                <span> {formatNum(min)}</span>
                <span> {formatNum(max)}</span>
            </div>
            <div className="slider-wrapper">
                <input
                    type="range"
                    ref={rangeRef}
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={handleChange}
                    className="custom-slider"
                />
                <div
                    className="tooltip"
                    ref={tooltipRef}
                    style={{
                        display: showTooltip || staticTooltip ? 'block' : 'none',
                        left: `${tooltipLeft}px`,
                        visibility: 'visible', // Ensure tooltip is always visible
                        opacity: 1 // Ensure tooltip is always opaque
                    }}
                >
                    {formatNum(value)}
                </div>
            </div>
        </div>
    );
};

SubscriberSlider.propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    defaultValue: PropTypes.number,
    staticTooltip: PropTypes.bool,
    allowedValues: PropTypes.arrayOf(PropTypes.number).isRequired,
    onChange: PropTypes.func.isRequired,
};

SubscriberSlider.defaultProps = {
    min: 0,
    max: 1000,
    step: 1,
    defaultValue: 500,
    staticTooltip: false,
};

export default SubscriberSlider;