import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Input,
  Select,
  SelectItem,
  Tooltip,
  Textarea,
  Pagination,
  PaginationSize,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  useDisclosure,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Chip,
  ChipProps,
  Checkbox,
  SortDescriptor,
  SortDirection,
  useSortableColumn,
  TableHeaderProps,
  Spinner
} from "@nextui-org/react";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { SearchIcon } from "@/components/icons/SearchIcon";
import { VerticalDotsIcon } from "@/components/icons/VerticalDotsIcon";
import { EditIcon } from "@/components/icons/EditIcon";
import { DeleteIcon } from "@/components/icons/DeleteIcon";
import { EyeIcon } from "@/components/icons/EyeIcon";
import { CSVIcon } from "@/components/icons/CSVIcon";
import { ExcelIcon } from "@/components/icons/ExcelIcon";
import { PDFIcon } from "@/components/icons/PDFIcon";
import { toast } from 'react-hot-toast';
import { customerService, campaignService, filialeService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { NewCustomerDialog } from '@/components/customers/NewCustomerDialog';
import { UpdateCustomerDialog } from '@/components/customers/UpdateCustomerDialog';
import { DeleteCustomerDialog } from '@/components/customers/DeleteCustomerDialog';
import { CustomerDetailsDialog } from '@/components/customers/CustomerDetailsDialog';

interface Customer {
  id: number;
  name: string;
  company: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  priority: 'high' | 'medium' | 'low';
  notes: string;
  filiale_id: number | null;
  campaign_id: number | null;
  imported_by: number | null;
  import_source: string;
  last_contact: string | null;
  created_at: string;
  updated_at: string;
}

const INITIAL_VISIBLE_COLUMNS = ["name", "company", "email", "city", "priority", "actions"];

const statusOptions = [
  { label: "Hoch", value: "high" },
  { label: "Mittel", value: "medium" },
  { label: "Niedrig", value: "low" },
];

const defaultContent = "Keine Notizen vorhanden";

const Customers = () => {
  const [filterValue, setFilterValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Set<string>>([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [selectedKeys, setSelectedKeys] = useState<React.Key>(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState<Set<string>>(new Set(INITIAL_VISIBLE_COLUMNS));

  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onOpenChange: onDetailsOpenChange } = useDisclosure();
  const { isOpen: isCreateDialogOpen, onOpen: onCreateDialogOpen, onOpenChange: onCreateDialogOpenChange } = useDisclosure();
  const { isOpen: isUpdateDialogOpen, onOpen: onUpdateDialogOpen, onOpenChange: onUpdateDialogOpenChange } = useDisclosure();
  const { isOpen: isDeleteDialogOpen, onOpen: onDeleteDialogOpen, onOpenChange: onDeleteDialogOpenChange } = useDisclosure();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAllSelected, setIsAllSelected] = useState(false);

  const queryClient = useQueryClient();

  const { data: customers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.getCustomers()
  });

  const { data: filialen = [], isLoading: filialenLoading, error: filialenError } = useQuery({
    queryKey: ['filialen'],
    queryFn: () => filialeService.getFilialen()
  });

  const { data: campaigns = [], isLoading: campaignsLoading, error: campaignsError } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignService.getCampaigns(),
    onError: (error: any) => {
      console.error('Error fetching campaigns:', error);
    }
  });

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "company", label: "Firma" },
      { key: "email", label: "Email" },
      { key: "address", label: "Adresse" },
      { key: "city", label: "Stadt" },
      { key: "postal_code", label: "PLZ" },
      { key: "priority", label: "Priorität" },
      { key: "notes", label: "Notizen" },
      { key: "filiale_id", label: "Filiale" },
      { key: "campaign_id", label: "Kampagne" },
      { key: "imported_by", label: "Importiert von" },
      { key: "import_source", label: "Importquelle" },
      { key: "last_contact", label: "Letzter Kontakt" },
      { key: "created_at", label: "Erstellt am" },
      { key: "updated_at", label: "Aktualisiert am" },
      { key: "actions", label: "Aktionen" },
    ];

    return columns.filter((column) =>
      visibleColumns.size === 0 ?
        INITIAL_VISIBLE_COLUMNS.includes(column.key) :
        visibleColumns.has(column.key)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredCustomers = [...customers];

    if (hasSearchFilter) {
      filteredCustomers = filteredCustomers.filter((customer) =>
        customer.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        customer.company?.toLowerCase().includes(filterValue.toLowerCase()) ||
        customer.email?.toLowerCase().includes(filterValue.toLowerCase()) ||
        customer.city?.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (selectedStatus.size > 0) {
      filteredCustomers = filteredCustomers.filter((customer) =>
        selectedStatus.has(customer.priority)
      );
    }

    return filteredCustomers;
  }, [customers, filterValue, selectedStatus]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [filteredItems, page, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a: any, b: any) => {
      const first = a[sortDescriptor.column as string];
      const second = b[sortDescriptor.column as string];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [items, sortDescriptor]);

  const tableColumns = React.useMemo(() => {
    const columns = [
      { key: "name", label: "Name" },
      { key: "company", label: "Firma" },
      { key: "email", label: "Email" },
      { key: "city", label: "Stadt" },
      { key: "priority", label: "Priorität" },
      { key: "actions", label: "Aktionen" },
    ];

    return columns.filter((column) =>
      visibleColumns.size === 0 ?
        INITIAL_VISIBLE_COLUMNS.includes(column.key) :
        visibleColumns.has(column.key)
    );
  }, [visibleColumns]);

  const renderCell = React.useCallback((customer: Customer, columnKey: React.Key): React.ReactNode => {
    switch (columnKey) {
      case "name":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">{customer.name}</p>
          </div>
        );
      case "company":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">{customer.company}</p>
          </div>
        );
      case "email":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small">{customer.email}</p>
          </div>
        );
      case "city":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">{customer.city}</p>
          </div>
        );
      case "priority":
        const statusColorMap: { [key: string]: ChipProps["color"] } = {
          high: "danger",
          medium: "warning",
          low: "success",
        };
        return (
          <Chip className="capitalize" color={statusColorMap[customer.priority]} size="sm" variant="flat">
            {customer.priority}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Tooltip content="Details">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => {
                setSelectedCustomer(customer);
                onDetailsOpen();
              }}>
                <EyeIcon />
              </span>
            </Tooltip>
            <Tooltip content="Bearbeiten">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50" onClick={() => {
                setSelectedCustomer(customer);
                onUpdateDialogOpen();
              }}>
                <EditIcon />
              </span>
            </Tooltip>
            <Tooltip content="Löschen">
              <span className="text-lg text-danger cursor-pointer active:opacity-50" onClick={() => {
                setSelectedCustomer(customer);
                onDeleteDialogOpen();
              }}>
                <DeleteIcon />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return null;
    }
  }, []);

  const onRowsPerPageChange = React.useCallback((e: any) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value?: string) => {
    if (value === "") {
      setFilterValue("");
    } else {
      setFilterValue(value);
    }
    setPage(1);
  }, []);

  const onStatusChange = React.useCallback((value: Set<string>) => {
    setSelectedStatus(value);
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="Suche nach Name, Firma oder Email..."
            startContent={<SearchIcon className="text-default-300" />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={onSearchChange}
          />
          <Button className="bg-foreground text-background" onPress={onCreateDialogOpen}>
            <PlusIcon />
            Neuen Kunden hinzufügen
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <Select
            label="Priorität"
            className="w-full sm:max-w-[26%]"
            placeholder="Filtern nach Priorität"
            selectedKeys={selectedStatus}
            onChange={onStatusChange}
          >
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </Select>
          <div className="hidden md:flex gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<VerticalDotsIcon className="text-default-300" />}
                  variant="flat"
                >
                  Spalten
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Spalten"
                closeOnSelect={false}
                selectionMode="multiple"
                selectedKeys={visibleColumns}
                onSelectionChange={setVisibleColumns}
              >
                {headerColumns.map((column) => (
                  <DropdownItem key={column.key} className="capitalize">
                    {column.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<VerticalDotsIcon className="text-default-300" />}
                  variant="flat"
                >
                  Export
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Static Actions">
                <DropdownItem key="csv" onClick={() => exportToCSV(customers, 'customers')}>
                  CSV Export
                  <CSVIcon size={16} className="ml-1 text-default-500" />
                </DropdownItem>
                <DropdownItem key="excel" onClick={() => exportToExcel(customers, 'customers')}>
                  Excel Export
                  <ExcelIcon size={16} className="ml-1 text-default-500" />
                </DropdownItem>
                <DropdownItem key="pdf" onClick={() => exportToPDF(customers, 'customers')}>
                  PDF Export
                  <PDFIcon size={16} className="ml-1 text-default-500" />
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    );
  }, [
    filterValue,
    selectedStatus,
    onSearchChange,
    onStatusChange,
    headerColumns,
    customers,
    onCreateDialogOpen
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={page}
          total={pages}
          onChange={(page) => setPage(page)}
        />
        <span className="text-small text-default-500">
          {filteredItems.length} Einträge
        </span>
      </div>
    );
  }, [selectedKeys, filialen, page, pages, filteredItems.length, rowsPerPage]);

  const Slots = {
    loading: (
      <TableRow>
        <TableCell colSpan={tableColumns.length + 1}>
          <div className="flex items-center justify-center space-x-2">
            <Spinner size="lg" />
            <span className="text-gray-500">Lade Daten...</span>
          </div>
        </TableCell>
      </TableRow>
    ),
    empty: (
      <TableRow>
        <TableCell colSpan={tableColumns.length + 1}>
          Keine Einträge gefunden.
        </TableCell>
      </TableRow>
    ),
  };

  return (
    <>
      <Table
        aria-label="Kundenliste"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        topContent={topContent}
        topContentPlacement="outside"
        selectionMode="single"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      >
        <TableHead>
          {tableColumns.map((column) => (
            <TableHeader key={column.key} sortable={column.key !== "actions"} >
              {column.label}
            </TableHeader>
          ))}
        </TableHead>
        <TableBody
          items={sortedItems}
          isLoading={isLoading}
          emptyContent={Slots.empty}
          loadingContent={Slots.loading}
        >
          {(item) => (
            <TableRow key={item.id}>
              {tableColumns.map((columnKey) => (
                <TableCell key={`${item.id}-${columnKey.key}`}>
                  {renderCell(item, columnKey.key)}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <NewCustomerDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={onCreateDialogOpenChange}
        onSuccess={() => {
          refetch();
        }}
        filialen={filialen}
        campaigns={campaigns}
      />

      <UpdateCustomerDialog
        isOpen={isUpdateDialogOpen}
        onOpenChange={onUpdateDialogOpenChange}
        customer={selectedCustomer}
        onSuccess={() => {
          refetch();
        }}
        filialen={filialen}
        campaigns={campaigns}
      />

      <DeleteCustomerDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={onDeleteDialogOpenChange}
        customer={selectedCustomer}
        onSuccess={() => {
          refetch();
        }}
      />

      <CustomerDetailsDialog
        isOpen={isDetailsOpen}
        onOpenChange={onDetailsOpenChange}
        customer={selectedCustomer}
      />
    </>
  );
}

export default Customers;
