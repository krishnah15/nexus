import { Response, NextFunction } from 'express';
import { AuthRequest, param } from '../../middleware/auth';
import * as countriesService from './countries.service';
import { success } from '../../utils/api-response';

export async function getCountries(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const countries = await countriesService.getCountries(req.userId!);
    return success(res, countries);
  } catch (err) { next(err); }
}

export async function getCountry(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const country = await countriesService.getCountry(req.userId!, param(req, 'id'));
    return success(res, country);
  } catch (err) { next(err); }
}

export async function createCountry(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const country = await countriesService.createCountry(req.userId!, req.body);
    return success(res, country, 201);
  } catch (err) { next(err); }
}

export async function updateCountry(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const country = await countriesService.updateCountry(req.userId!, param(req, 'id'), req.body);
    return success(res, country);
  } catch (err) { next(err); }
}

export async function deleteCountry(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await countriesService.deleteCountry(req.userId!, param(req, 'id'));
    return success(res, { message: 'Country deleted' });
  } catch (err) { next(err); }
}

// Pathways
export async function getPathways(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const pathways = await countriesService.getPathways(req.userId!, param(req, 'countryId'));
    return success(res, pathways);
  } catch (err) { next(err); }
}

export async function createPathway(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const pathway = await countriesService.createPathway(req.userId!, param(req, 'countryId'), req.body);
    return success(res, pathway, 201);
  } catch (err) { next(err); }
}

export async function updatePathway(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const pathway = await countriesService.updatePathway(req.userId!, param(req, 'countryId'), param(req, 'id'), req.body);
    return success(res, pathway);
  } catch (err) { next(err); }
}

export async function deletePathway(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await countriesService.deletePathway(req.userId!, param(req, 'countryId'), param(req, 'id'));
    return success(res, { message: 'Pathway deleted' });
  } catch (err) { next(err); }
}
