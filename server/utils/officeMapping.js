const OFFICE_MAPPING = {
  Facilities: 'Maintenance Office',
  Academic: 'Academic Affairs Office',
  Security: 'Campus Security Office',
  Canteen: 'Student Services & Dining',
  Other: 'General Administration',
};

const getAssignedOffice = (category) => {
  return OFFICE_MAPPING[category] || 'General Administration';
};

module.exports = { OFFICE_MAPPING, getAssignedOffice };
