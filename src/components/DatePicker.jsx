import React, { useState,forwardRef } from "react";
import DatePicker from "react-datepicker";
import { isSameDay } from "date-fns";
import classNames from "classnames";
import PropTypes from "prop-types";
import "react-datepicker/dist/react-datepicker.css";
import "./DatePicker.scss"; // Path to your CSS file

function CustomDatePicker({ dateFormat, timeFormat, pickerType = "datetime", onChange, className, ...props }) {
  const [startDate, setStartDate] = useState(new Date());
  const showTimeSelect = timeFormat !== undefined;
  const computedClassName = classNames("date-picker-container", className);

  const convertFormat = (phpFormat) => {
    return phpFormat
      .replace(/Y/g, "yyyy")
      .replace(/m/g, "MM")
      .replace(/d/g, "dd")
      .replace(/H/g, "HH")
      .replace(/h/g, "hh")
      .replace(/i/g, "mm")
      .replace(/s/g, "ss")
      .replace(/A/g, "aa")
      .replace(/a/g, "aa");
  };
  // Calculate +2 hours from now for minTime
  const minDate = new Date(new Date().setHours(new Date().getHours() + 2));
  const minTime = new Date(new Date().setHours(new Date().getHours() + 2));
  const maxTime = new Date(new Date().setHours(23, 59)); // Set maxTime to the end of the day

  const handleDateChange = (date) => {
    setStartDate(date);
    onChange(date)
  };
  const getDateFormat = () => {
    const format = pickerType === "time" ? timeFormat : dateFormat;
    return (
      convertFormat(format) +
      (pickerType === "datetime" ? ` ${convertFormat(timeFormat)}` : "")
    );
  };

  return (
    <div className={computedClassName}>
      <DatePicker
        selected={startDate}
        onChange={handleDateChange}
        dateFormat={getDateFormat()}
        timeFormat={convertFormat(timeFormat)}
        timeIntervals={10}
        showTimeSelect={pickerType !== "date"}
        showTimeSelectOnly={pickerType === "time"}
        showDateInput={pickerType !== "time"}
        minDate={pickerType !== "time" ? minDate : undefined}
        minTime={(pickerType !== "date" && isSameDay(startDate, minDate)) ? minTime : undefined}
        maxTime={(pickerType !== "date" && isSameDay(startDate, minDate)) ? maxTime : undefined}
        customInput={<DateInput pickerType={pickerType} />}
      />
    </div>
  );
}

const DateInput = forwardRef(({ value, onClick, pickerType }) => {
  return (
    <button onClick={onClick} className="date-input">
      {pickerType === "time" ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 8C1 6.14348 1.7375 4.36301 3.05025 3.05025C4.36301 1.7375 6.14348 1 8 1C9.85652 1 11.637 1.7375 12.9497 3.05025C14.2625 4.36301 15 6.14348 15 8C15 9.85652 14.2625 11.637 12.9497 12.9497C11.637 14.2625 9.85652 15 8 15C6.14348 15 4.36301 14.2625 3.05025 12.9497C1.7375 11.637 1 9.85652 1 8ZM8.75 3.75C8.75 3.55109 8.67098 3.36032 8.53033 3.21967C8.38968 3.07902 8.19891 3 8 3C7.80109 3 7.61032 3.07902 7.46967 3.21967C7.32902 3.36032 7.25 3.55109 7.25 3.75V8C7.25 8.414 7.586 8.75 8 8.75H11.25C11.4489 8.75 11.6397 8.67098 11.7803 8.53033C11.921 8.38968 12 8.19891 12 8C12 7.80109 11.921 7.61032 11.7803 7.46967C11.6397 7.32902 11.4489 7.25 11.25 7.25H8.75V3.75Z"
            fill="black"
          />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.75 7.5C5.55109 7.5 5.36032 7.57902 5.21967 7.71967C5.07902 7.86032 5 8.05109 5 8.25C5 8.44891 5.07902 8.63968 5.21967 8.78033C5.36032 8.92098 5.55109 9 5.75 9C5.94891 9 6.13968 8.92098 6.28033 8.78033C6.42098 8.63968 6.5 8.44891 6.5 8.25C6.5 8.05109 6.42098 7.86032 6.28033 7.71967C6.13968 7.57902 5.94891 7.5 5.75 7.5ZM7.25 8.25C7.25 8.05109 7.32902 7.86032 7.46967 7.71967C7.61032 7.57902 7.80109 7.5 8 7.5H10.25C10.4489 7.5 10.6397 7.57902 10.7803 7.71967C10.921 7.86032 11 8.05109 11 8.25C11 8.44891 10.921 8.63968 10.7803 8.78033C10.6397 8.92098 10.4489 9 10.25 9H8C7.80109 9 7.61032 8.92098 7.46967 8.78033C7.32902 8.63968 7.25 8.44891 7.25 8.25ZM5.75 9.5C5.55109 9.5 5.36032 9.57902 5.21967 9.71967C5.07902 9.86032 5 10.0511 5 10.25C5 10.4489 5.07902 10.6397 5.21967 10.7803C5.36032 10.921 5.55109 11 5.75 11H8C8.19891 11 8.38968 10.921 8.53033 10.7803C8.67098 10.6397 8.75 10.4489 8.75 10.25C8.75 10.0511 8.67098 9.86032 8.53033 9.71967C8.38968 9.57902 8.19891 9.5 8 9.5H5.75Z"
            fill="black"
          />
          <path
            d="M4.75 1C4.55109 1 4.36032 1.07902 4.21967 1.21967C4.07902 1.36032 4 1.55109 4 1.75V3C3.46957 3 2.96086 3.21071 2.58579 3.58579C2.21071 3.96086 2 4.46957 2 5V12C2 12.5304 2.21071 13.0391 2.58579 13.4142C2.96086 13.7893 3.46957 14 4 14H12C12.5304 14 13.0391 13.7893 13.4142 13.4142C13.7893 13.0391 14 12.5304 14 12V5C14 4.46957 13.7893 3.96086 13.4142 3.58579C13.0391 3.21071 12.5304 3 12 3V1.75C12 1.55109 11.921 1.36032 11.7803 1.21967C11.6397 1.07902 11.4489 1 11.25 1C11.0511 1 10.8603 1.07902 10.7197 1.21967C10.579 1.36032 10.5 1.55109 10.5 1.75V3H5.5V1.75C5.5 1.55109 5.42098 1.36032 5.28033 1.21967C5.13968 1.07902 4.94891 1 4.75 1ZM3.5 7C3.5 6.73478 3.60536 6.48043 3.79289 6.29289C3.98043 6.10536 4.23478 6 4.5 6H11.5C11.7652 6 12.0196 6.10536 12.2071 6.29289C12.3946 6.48043 12.5 6.73478 12.5 7V11.5C12.5 11.7652 12.3946 12.0196 12.2071 12.2071C12.0196 12.3946 11.7652 12.5 11.5 12.5H4.5C4.23478 12.5 3.98043 12.3946 3.79289 12.2071C3.60536 12.0196 3.5 11.7652 3.5 11.5V7Z"
            fill="black"
          />
        </svg>
      )}
      {value}
    </button>
  );
})

CustomDatePicker.propTypes = {
    dateFormat: PropTypes.string,
    timeFormat: PropTypes.string,
    pickerType: PropTypes.string,
    onChange: PropTypes.func,
    className: PropTypes.string,
}

export default CustomDatePicker;
