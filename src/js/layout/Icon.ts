/* eslint-disable */
// @ts-ignore
import addColumn from "../../icons/addColumn.svg";
// @ts-ignore
import addRow from "../../icons/addRow.svg";
// @ts-ignore
import checkboxGroup from "../../icons/checkboxGroup.svg";
// @ts-ignore
import colorField from "../../icons/colorField.svg"
// @ts-ignore
import copy from "../../icons/copy.svg";
// @ts-ignore
import dateField from "../../icons/dateField.svg";
// @ts-ignore
import deleteIcon from "../../icons/deleteIcon.svg";
// @ts-ignore
import deleteColumn from "../../icons/deleteColumn.svg"
// @ts-ignore
import deleteRow from "../../icons/deleteRow.svg"
// @ts-ignore
import header from "../../icons/header.svg";
// @ts-ignore
import horizontalDrag from "../../icons/horizontalDrag.svg";
// @ts-ignore
import horizontalRule from "../../icons/horizontalRule.svg";
// @ts-ignore
import monthField from "../../icons/monthField.svg";
// @ts-ignore
import multiDrag from "../../icons/multiDrag.svg";
// @ts-ignore
import paragraph from "../../icons/paragraph.svg";
// @ts-ignore
import radioGroup from "../../icons/radioGroup.svg";
// @ts-ignore
import rangeField from "../../icons/rangeField.svg";
// @ts-ignore
import selectField from "../../icons/selectField.svg"
// @ts-ignore
import textArea from "../../icons/textArea.svg";
// @ts-ignore
import textField from "../../icons/textField.svg";
// @ts-ignore
import timeField from "../../icons/timeField.svg";
// @ts-ignore
import toolbox from "../../icons/toolbox.svg";
// @ts-ignore
import verticalDrag from "../../icons/verticalDrag.svg";
// @ts-ignore
import weekField from "../../icons/weekField.svg";
// @ts-ignore
import wrench from "../../icons/wrench.svg";

export default class Icon {
    static icons = {
        addColumn: addColumn,
        addRow: addRow,
        checkboxGroup: checkboxGroup,
        colorField: colorField,
        copy: copy,
        dateField: dateField,
        deleteIcon: deleteIcon,
        deleteColumn: deleteColumn,
        deleteRow: deleteRow,
        header: header,
        horizontalDrag: horizontalDrag,
        horizontalRule: horizontalRule,
        monthField: monthField,
        multiDrag: multiDrag,
        paragraph: paragraph,
        radioGroup: radioGroup,
        rangeField: rangeField,
        selectField: selectField,
        textArea: textArea,
        textField: textField,
        timeField: timeField,
        toolbox: toolbox,
        verticalDrag: verticalDrag,
        weekField: weekField,
        wrench: wrench
    };

    static getIcon(icon): string {
        if (!Icon.icons[icon])
            return null;

        return `<svg width="20" height="20"><use xlink:href="#${Icon.icons[icon].id}"></use></svg>`;
    }
}