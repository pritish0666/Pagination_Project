import React, { useState, useEffect, useRef } from "react";

import {
  DataTable,
  DataTablePageEvent,
  DataTableSelectEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";

import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { OverlayPanel } from "primereact/overlaypanel";
import axios from "axios";
import { Artwork, ApiResponse } from "./types/ArtWork";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import "./App.css"; 
const App: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [first, setFirst] = useState(0);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [inputRows, setInputRows] = useState<string>(""); 
  const rows = 12;

  const overlayPanelRef = useRef<OverlayPanel>(null);


  //Initil API call for rendering page wise data
  const loadArtworks = async () => {
    setLoading(true);
    try {
      
      const response = await axios.get<ApiResponse>(
        `https://api.artic.edu/api/v1/artworks`,
        {
          params: {
            page: pageNum,
            limit: rows,
            fields:
              "id,title,place_of_origin,artist_display,inscriptions,date_start,date_end",
          },
        }
      );
      setArtworks(response.data.data);
      setTotalRecords(response.data.pagination.total);
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtworks();
  }, [pageNum]);


  
  const onPage = (event: DataTablePageEvent) => {
    setPageNum(event.page ? event.page + 1 : 1);
    setFirst(event.first);
  };

  const onSelectionChange = (event: DataTableSelectEvent<Artwork>) => {
    setSelectedArtworks(event.value);
  };


  //API call for selected data and limited rendering
  const selectArtworksAcrossPages = async (count: number) => {
    let selected: Artwork[] = [];
    const pagesToLoad = Math.ceil(count / rows); 
    let remaining = count;

    for (let page = 1; page <= pagesToLoad; page++) {
      try {
        const response = await axios.get<ApiResponse>(
          `https://api.artic.edu/api/v1/artworks`,
          {
            params: {
              page,
              limit: rows,
              fields:
                "id,title,place_of_origin,artist_display,inscriptions,date_start,date_end",
            },
          }
        );

        const artworksToSelect = response.data.data.slice(
          0,
          Math.min(remaining, rows)
        );
        selected = [...selected, ...artworksToSelect];
        remaining -= artworksToSelect.length;
      } catch (error) {
        console.error("Error selecting artworks across pages:", error);
        break;
      }
    }

    setSelectedArtworks(selected);
  };

  const onSubmit = () => {
    const rowsNumber = parseInt(inputRows, 10);
    if (rowsNumber > 0) {
      selectArtworksAcrossPages(rowsNumber);
      if (overlayPanelRef.current) {
        overlayPanelRef.current.hide(); 
      }
    }
  };

  const checkboxTemplate = (rowData: Artwork) => {
    return (
      <Checkbox
        checked={selectedArtworks.some((artwork) => artwork.id === rowData.id)}
        
      />
    );
  };

  const titleHeader = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span>Title</span>
      <Button
        icon="pi pi-chevron-down"
        className="p-button-text p-button-plain"
        style={{ marginLeft: "8px" }}
        onClick={(e) => overlayPanelRef.current?.toggle(e)}
      />
      <OverlayPanel ref={overlayPanelRef}>
        <div className="p-grid p-nogutter">
          <div className="p-col">
            <label htmlFor="rowCount">Enter Number of Rows:</label>
            <InputText
              id="rowCount"
              value={inputRows}
              onChange={(e) => setInputRows(e.target.value)} 
              placeholder="Enter number"
              type="number"
            />
          </div>
          <div className="p-col">
            <Button label="Submit" onClick={onSubmit} />
          </div>
        </div>
      </OverlayPanel>
    </div>
  );

  return (
    <div className="card">
      <DataTable
        value={artworks}
        lazy
        paginator
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPage={onPage}
        loading={loading}
        emptyMessage="No artworks found."
        selection={selectedArtworks}
        onSelectionChange={onSelectionChange}
        dataKey="id"
        className="custom-datatable" 
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3em" }}
          body={checkboxTemplate}
        />
        <Column field="title" header={titleHeader} />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>

      <div>
        <h3>Selected Artworks: {selectedArtworks.length}</h3>
      </div>
    </div>
  );
};

export default App;
