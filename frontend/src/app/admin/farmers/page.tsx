"use client";

import { useState, useEffect } from "react";
import { Users, Search, Filter, MapPin, Award, Phone, Mail, Edit, CheckCircle } from "lucide-react";
import { farmersApi } from "@/lib/api";
import { Farmer } from "@/types";
import toast from "react-hot-toast";

export default function AdminFarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [editingScoreId, setEditingScoreId] = useState<number | null>(null);
  const [newScore, setNewScore] = useState<number>(75);

  useEffect(() => {
    loadFarmers();
  }, []);

  const loadFarmers = async () => {
    try {
      const res = await farmersApi.getAll();
      setFarmers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load farmers list");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScore = async (farmerId: number) => {
    try {
      await farmersApi.updateScore(farmerId, newScore);
      toast.success("Farmer reliability score updated!");
      setEditingScoreId(null);
      loadFarmers();
    } catch (err) {
      toast.error("Failed to update reliability score");
    }
  };

  const filteredFarmers = farmers.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.crops?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict = districtFilter === "all" || f.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  const uniqueDistricts = Array.from(new Set(farmers.map((f) => f.district).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-600" /> Farmers Directory
          </h1>
          <p className="text-sm text-gray-500">
            View registered farmers, geographical distribution, crops cultivated, and manage reliability scores.
          </p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, district, or crop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="input text-sm py-2"
          >
            <option value="all">All Districts</option>
            {uniqueDistricts.map((d) => (
              <option key={d} value={d!}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Farmers Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Farmer Details</th>
              <th>Location</th>
              <th>Farm Size & Crops</th>
              <th>GPS Coordinates</th>
              <th>Reliability Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  Loading farmers directory...
                </td>
              </tr>
            ) : filteredFarmers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No farmers found.
                </td>
              </tr>
            ) : (
              filteredFarmers.map((farmer) => (
                <tr key={farmer.id}>
                  <td>
                    <div className="font-bold text-gray-900">{farmer.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-600" /> {farmer.phone}
                    </div>
                  </td>
                  <td>
                    <div className="text-xs font-semibold text-gray-800">
                      {farmer.village}, {farmer.district}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {farmer.state} - {farmer.pincode}
                    </div>
                  </td>
                  <td>
                    <div className="text-xs font-bold text-emerald-700">{farmer.farm_size} Acres</div>
                    <div className="text-xs text-gray-600 max-w-xs truncate">{farmer.crops}</div>
                  </td>
                  <td>
                    <div className="text-xs font-mono text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      {farmer.latitude?.toFixed(4)}, {farmer.longitude?.toFixed(4)}
                    </div>
                  </td>
                  <td>
                    {editingScoreId === farmer.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newScore}
                          onChange={(e) => setNewScore(Number(e.target.value))}
                          className="w-16 input text-xs py-1 px-2"
                        />
                        <button
                          onClick={() => handleUpdateScore(farmer.id)}
                          className="btn btn-primary text-xs py-1 px-2"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`badge ${
                            farmer.reliability_score >= 80
                              ? "badge-emerald"
                              : farmer.reliability_score >= 60
                              ? "badge-amber"
                              : "badge-red"
                          } flex items-center gap-1`}
                        >
                          <Award className="w-3 h-3" /> {farmer.reliability_score} / 100
                        </span>
                        <button
                          onClick={() => {
                            setEditingScoreId(farmer.id);
                            setNewScore(farmer.reliability_score);
                          }}
                          className="text-gray-400 hover:text-emerald-600"
                          title="Edit score"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="text-xs text-gray-500">ID #{farmer.id}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
