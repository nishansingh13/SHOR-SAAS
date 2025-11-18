import OrganizationModel from '../models/organization.models.js';
import UserModel from '../models/user.models.js';

// Create a new organization
export const createOrganization = async (req, res) => {
  try {
    const { name, description, logo, email, phone, address, website } = req.body;
    const userId = req.user.id;

    // Check if user already has an organization
    const user = await UserModel.findById(userId);
    if (user.organization) {
      return res.status(400).json({ error: 'User already belongs to an organization' });
    }

    const organization = new OrganizationModel({
      name,
      description,
      logo,
      email,
      phone,
      address,
      website,
      owner: userId,
      members: [{
        user: userId,
        role: 'admin',
      }],
    });

    await organization.save();

    // Update user's organization reference
    user.organization = organization._id;
    await user.save();

    res.status(201).json(organization);
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
};

// Get all organizations (admin only)
export const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await OrganizationModel.find()
      .populate('owner', 'name email')
      .populate('members.user', 'name email');
    res.json(organizations);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
};

// Get organization by ID
export const getOrganizationById = async (req, res) => {
  try {
    const organization = await OrganizationModel.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
};

// Get user's organization
export const getUserOrganization = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId).populate('organization');
    
    if (!user.organization) {
      return res.status(404).json({ error: 'User does not belong to any organization' });
    }

    const organization = await OrganizationModel.findById(user.organization._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    res.json(organization);
  } catch (error) {
    console.error('Error fetching user organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
};

// Update organization
export const updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const organization = await OrganizationModel.findById(id);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if user is owner or admin
    const isOwner = organization.owner.toString() === userId;
    const member = organization.members.find(m => m.user.toString() === userId);
    const isAdmin = member && member.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to update this organization' });
    }

    Object.assign(organization, updates);
    await organization.save();

    res.json(organization);
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
};

// Add member to organization
export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = req.user.id;

    const organization = await OrganizationModel.findById(id);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if user is owner or admin
    const isOwner = organization.owner.toString() === userId;
    const member = organization.members.find(m => m.user.toString() === userId);
    const isAdmin = member && member.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to add members' });
    }

    // Find user by email
    const newMember = await UserModel.findOne({ email });
    if (!newMember) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a member
    const existingMember = organization.members.find(
      m => m.user.toString() === newMember._id.toString()
    );
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    organization.members.push({
      user: newMember._id,
      role: role || 'staff',
    });

    await organization.save();

    // Update user's organization reference
    newMember.organization = organization._id;
    await newMember.save();

    res.json(organization);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
};

// Remove member from organization
export const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user.id;

    const organization = await OrganizationModel.findById(id);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Check if user is owner or admin
    const isOwner = organization.owner.toString() === userId;
    if (!isOwner) {
      return res.status(403).json({ error: 'Only owner can remove members' });
    }

    // Cannot remove owner
    if (memberId === organization.owner.toString()) {
      return res.status(400).json({ error: 'Cannot remove organization owner' });
    }

    organization.members = organization.members.filter(
      m => m.user.toString() !== memberId
    );

    await organization.save();

    // Remove organization reference from user
    const user = await UserModel.findById(memberId);
    if (user) {
      user.organization = undefined;
      await user.save();
    }

    res.json(organization);
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};

// Delete organization
export const deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const organization = await OrganizationModel.findById(id);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Only owner can delete
    if (organization.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Only owner can delete organization' });
    }

    // Remove organization reference from all members
    await UserModel.updateMany(
      { organization: id },
      { $unset: { organization: 1 } }
    );

    await OrganizationModel.findByIdAndDelete(id);

    res.json({ message: 'Organization deleted successfully' });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
};
