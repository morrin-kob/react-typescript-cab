import * as React from "react";
import { alpha } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableSortLabel from "@mui/material/TableSortLabel";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import Tooltip from "@mui/material/Tooltip";
import { SvgIcon } from "@mui/material";
import { visuallyHidden } from "@mui/utils";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export type CETColumnType = {
  id: string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
  align?: "left" | "center" | "right";
  format?: (value: number) => string;
  disablePadding?: boolean;
  numeric?: boolean;
};

export type CheckTargetProps = {
  icon: typeof SvgIcon;
  commandTip: string;
  onClick: (sels: readonly string[]) => void;
};

type CheckableEditableTableHeaderProps = {
  columns: CETColumnType[];
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  checkTarget?: CheckTargetProps;
  editable: boolean;
};

////////////////////////////////////////////////////////
// table header
////////////////////////////////////////////////////////
function CheckableEditableTableHead(props: CheckableEditableTableHeaderProps) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort
  } = props;
  const createSortHandler = (property: string) => (
    event: React.MouseEvent<unknown>
  ) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
        {/* チェックあり？ */}
        {props.checkTarget ? (
          <TableCell padding="checkbox" sx={{ backgroundColor: "#f0f0f0" }}>
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                "aria-label": "select all desserts"
              }}
            />
          </TableCell>
        ) : null}
        {props.columns.map((column) => (
          <TableCell
            sx={{ backgroundColor: "#f0f0f0" }}
            key={column.id}
            align={column.numeric ? "right" : "left"}
            padding={column.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === column.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === column.id}
              direction={orderBy === column.id ? order : "asc"}
              onClick={createSortHandler(column.id)}
            >
              {column.label}
              {orderBy === column.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}

        {/* エディット可能？ */}
        {props.editable ? (
          <TableCell
            sx={{ backgroundColor: "#f0f0f0" }}
            key={"editicon"}
            align={"center"}
            padding={"none"}
          >
            <EditIcon />
          </TableCell>
        ) : null}
      </TableRow>
    </TableHead>
  );
}

////////////////////////////////////////////
// テーブルの上に配置する削除とかのアクション
////////////////////////////////////////////
interface CheckableEditableTableToolbarProps {
  tableTitle: string;
  sellist: readonly string[];
  checkTarget?: CheckTargetProps;
}

const CheckableEditableTableToolbar = (
  props: CheckableEditableTableToolbarProps
) => {
  const numSelected = props.sellist.length;
  const checkCBFunc = props.checkTarget
    ? props.checkTarget.onClick
    : (sels: readonly string[]) => {};

  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(12, 1fr)"
      gap={2}
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        py: 1,
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            )
        })
      }}
    >
      <Box gridColumn="span 4">
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="inherit"
            variant="subtitle1"
            align="left"
            component="div"
          >
            {numSelected} 件選択されてます
          </Typography>
        ) : (
          <Typography
            sx={{ flex: "1 1 100%" }}
            variant="h6"
            align="left"
            id="tableTitle"
            component="div"
          >
            {props.tableTitle}
          </Typography>
        )}
      </Box>
      <Box gridColumn="span 1">
        {props.checkTarget && numSelected > 0 ? (
          <Tooltip title={props.checkTarget.commandTip}>
            <IconButton
              size="small"
              color="primary"
              onClick={(event) => checkCBFunc(props.sellist)}
            >
              <props.checkTarget.icon />
            </IconButton>
          </Tooltip>
        ) : (
          <></>
        )}
      </Box>
    </Box>
  );
};

//////////////////////////////////////////////////////
// table 本体
//////////////////////////////////////////////////////
export type CheckableEditableTableProps = {
  tableTitle: string;
  dataType: string;
  columns: CETColumnType[];
  rows: {}[];
  rowHSize: "small" | "medium";
  rowPerPageOptions: number[];
  keyField: string;
  labelField: string;
  checkTarget?: CheckTargetProps;
  onDetail?: (key: string, label: string) => void;
  onEdit?: (key: string, label: string) => void;
};
// CheckableEditableTable

export default function CheckableEditableTable(
  props: CheckableEditableTableProps
) {
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState("");
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(
    props.rowPerPageOptions[0]
  );

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = props.rows.map((n) => n[props.keyField]);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  return (
    <Box sx={{ width: "100%" }}>
      {/* <Paper sx={{ width: '100%', mb: 2 }}> */}
      <CheckableEditableTableToolbar
        tableTitle={props.tableTitle}
        sellist={selected}
        checkTarget={props.checkTarget}
      />
      <TableContainer sx={{ maxHeight: "calc( 100vh - 16.00em )" }}>
        <Table
          stickyHeader
          sx={{ minWidth: 250 }}
          aria-labelledby="tableTitle"
          size={props.rowHSize}
        >
          <CheckableEditableTableHead
            columns={props.columns}
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={props.rows.length}
            checkTarget={props.checkTarget}
            editable={props.onEdit ? true : false}
          />
          <TableBody>
            {props.rows
              .slice()
              .sort(getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const isItemSelected = isSelected(String(row[props.keyField]));
                const labelId = `enhanced-table-checkbox-${index}`;

                const showDetailFunc = props.onDetail
                  ? props.onDetail
                  : (k: string, l: string) => {};
                const editCBFunc = props.onEdit
                  ? props.onEdit
                  : (k: string, l: string) => {};

                let fieldData = "";
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row[props.keyField]}
                    selected={isItemSelected}
                  >
                    {/* ---------- チェックボックスアリ？ ----------- */}
                    {props.checkTarget ? (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            "aria-labelledby": labelId
                          }}
                          onClick={(event) =>
                            handleClick(event, String(row[props.keyField]))
                          }
                        />
                      </TableCell>
                    ) : null}

                    {/* ----------- テーブルデータ ----------- */}
                    {props.columns.map((column) => (
                      <TableCell
                        align={column.align}
                        onClick={(event) =>
                          showDetailFunc(
                            row[props.keyField],
                            row[props.labelField]
                          )
                        }
                      >
                        {row[column.id]}
                      </TableCell>
                    ))}

                    {/* -------- 編集アリ？ --------- */}
                    {props.onEdit ? (
                      <TableCell align="center">
                        <IconButton
                          onClick={(event) =>
                            editCBFunc(
                              row[props.keyField],
                              row[props.labelField]
                            )
                          }
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    ) : null}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={props.rowPerPageOptions}
        component="div"
        count={props.rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {/* </Paper> */}
    </Box>
  );
}
