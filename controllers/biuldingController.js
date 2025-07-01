import {
  createBuilding as createBuildingService,
  getBuildingsByUser,
  getBuildingById as getBuildingByIdService,
  updateBuilding as updateBuildingService,
  deleteBuilding as deleteBuildingService,
} from '../services/biuldingService.js';

// Create building
export const createBuilding = async (req, res) => {
  try {
    const { user_id, name } = req.body;
    if (!user_id || !name) {
      return res.status(400).json({ message: 'user_id and name are required' });
    }
    console.log('Creating building:', user_id, name);
    const building = await createBuildingService(user_id, name);
    res.status(201).json(building);
    console.log('Created building:', building);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all buildings for a user
export const getAllBuildings = async (req, res) => {
  try {
    // Get user_id from authenticated user or query param (for testing)
    const user_id = req.user?.id || req.query.user_id;
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const buildings = await getBuildingsByUser(user_id);
    res.status(200).json(buildings);
  } catch (error) {
    console.error('Get buildings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get building by ID
export const getBuildingById = async (req, res) => {
  try {
    const building = await getBuildingByIdService(req.params.id);
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }
    res.status(200).json(building);
  } catch (error) {
    console.error('Get building by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update building
export const updateBuilding = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const updatedBuilding = await updateBuildingService(req.params.id, name);
    if (!updatedBuilding) {
      return res.status(404).json({ message: 'Building not found' });
    }
    res.status(200).json(updatedBuilding);
  } catch (error) {
    console.error('Update building error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete building
export const deleteBuilding = async (req, res) => {
  try {
    const deletedBuilding = await deleteBuildingService(req.params.id);
    if (!deletedBuilding) {
      return res.status(404).json({ message: 'Building not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Delete building error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
