const COLLECTIONS = [
  {
    id: "cells",
    label: "Cells",
    binId: "6a82eba3f5f4af5e291ff632",
    fields: [
      { key: "cellId", label: "Cell ID", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "category", label: "Category", type: "select", options: ["student", "bachelor", "institute"], required: true },
      { key: "status", label: "Status", type: "select", options: ["active", "plan", "yet_to_start", "not_active"], required: true },
      { key: "day", label: "Day", type: "text" },
      { key: "time", label: "Time", type: "text" },
      { key: "leader", label: "Leader", type: "text" },
      { key: "shepherd", label: "Shepherd", type: "text" },
      { key: "capacity", label: "Capacity", type: "number" },
      { key: "instituteLevel", label: "Institute Level", type: "select", options: ["true", "false"] }
    ]
  },
  {
    id: "members",
    label: "Members",
    binId: "6a82ec6ada38895dfeee6c69",
    fields: [
      { key: "memberId", label: "Member ID", type: "text", required: true },
      { key: "cellId", label: "Cell ID", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "standard", label: "Standard", type: "text" }
    ]
  },
  {
    id: "leaders",
    label: "Leaders",
    binId: "6a82ec44f5f4af5e291ff7fe",
    fields: [
      { key: "leaderId", label: "Leader ID", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "cellId", label: "Cell ID", type: "text" }
    ]
  },
  {
    id: "sheperds",
    label: "Shepherds",
    binId: "6a82ecadda38895dfeee6d30",
    fields: [
      { key: "shepherdId", label: "Shepherd ID", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "cells", label: "Cells (comma separated)", type: "text" }
    ]
  },
  {
    id: "followup",
    label: "Follow-up Students",
    binId: "6a82ec0dda38895dfeee6b90",
    fields: [
      { key: "fuId", label: "FU ID", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "cellId", label: "Cell ID", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["praying", "converted", "baptised", "backslidden"] }
    ]
  },
  {
    id: "prayerpoints",
    label: "Prayer Points",
    binId: "6a82ec8bf5f4af5e291ff8b1",
    fields: [
      { key: "pointId", label: "Point ID", type: "text", required: true },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "tamilText", label: "Tamil Text", type: "textarea" },
      { key: "scripture", label: "Scripture", type: "text" },
      { key: "order", label: "Order", type: "number" }
    ]
  }
];