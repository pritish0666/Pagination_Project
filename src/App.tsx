import React, { useState, useEffect } from "react";
import {
  DataTable,
  DataTablePageEvent,
  DataTableSelectEvent,
} from "primereact/datatable";
import { Column } from "primereact/column";
import { Checkbox } from "primereact/checkbox";
import axios from "axios";
import { Artwork, ApiResponse } from "./types/ArtWork";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const App: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [first, setFirst] = useState(0);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const rows = 12;

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

  const checkboxTemplate = (rowData: Artwork) => {
    return (
      <Checkbox
        checked={selectedArtworks.some((artwork) => artwork.id === rowData.id)}
        onChange={() => {}} // PrimeReact handles the change internally
      />
    );
  };

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
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3em" }}
          body={checkboxTemplate}
        />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>
      <div>
        <h3>Selected Artworks: {selectedArtworks.length}</h3>
        <ul>
          {selectedArtworks.map((artwork) => (
            <li key={artwork.id}>{artwork.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
