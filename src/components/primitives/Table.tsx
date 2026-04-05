import { HTMLAttributes, ReactNode, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

type TableProps = TableHTMLAttributes<HTMLTableElement> & {
  caption?: ReactNode;
};

export function Table({ children, className, caption, ...props }: TableProps) {
  return (
    <div className="ui-table-wrap">
      <table className={["ui-table", className ?? ""].filter(Boolean).join(" ")} {...props}>
        {caption ? <caption className="ui-table__caption">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={["ui-table__head", className ?? ""].filter(Boolean).join(" ")} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={["ui-table__body", className ?? ""].filter(Boolean).join(" ")} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={["ui-table__row", className ?? ""].filter(Boolean).join(" ")} {...props}>
      {children}
    </tr>
  );
}

export function TableHeaderCell({ children, className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={["ui-table__header-cell", className ?? ""].filter(Boolean).join(" ")} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={["ui-table__cell", className ?? ""].filter(Boolean).join(" ")} {...props}>
      {children}
    </td>
  );
}
