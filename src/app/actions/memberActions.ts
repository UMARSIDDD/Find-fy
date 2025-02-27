'use server';
import {cache} from 'react'
import { prisma } from '@/lib/prisma';
import { Member, Photo } from '@prisma/client';
import { addYears } from 'date-fns';
import { getAuthUserId } from './authActions';
import { GetMemberParams, PaginatedResponse } from '@/types';
import { unstable_cache } from 'next/cache';

function getAgeRange(ageRange: string): Date[] {
    const [minAge, maxAge] = ageRange.split(',');
    const currentDate = new Date();
    const minDob = addYears(currentDate, -maxAge - 1);
    const maxDob = addYears(currentDate, -minAge);

    return [minDob, maxDob];
}

export const getMember=unstable_cache(async({
    ageRange = '18,100',
    gender = 'male,female',
    orderBy = 'updated',
    pageNumber = '1',
    pageSize = '12',
    withPhoto = 'true',
    userId
}: GetMemberParams): Promise<PaginatedResponse<Member>> => {
    console.log("GET MEMBER CACHE")

    const [minDob, maxDob] = getAgeRange(ageRange);

    const selectedGender = gender.split(',');

    const page = parseInt(pageNumber);
    const limit = parseInt(pageSize);

    const skip = (page - 1) * limit;

    try {
        const membersSelect = {
            where: {
                AND: [
                    { dateOfBirth: { gte: minDob } },
                    { dateOfBirth: { lte: maxDob } },
                    { gender: { in: selectedGender } },
                    ...(withPhoto === 'true' ? [{ image: { not: null } }] : [])
                ],
                NOT: {
                    userId
                }
            },
        }

        const count = await prisma.member.count(membersSelect)

        const members = await prisma.member.findMany({
            ...membersSelect,
            orderBy: { [orderBy]: 'desc' },
            skip,
            take: limit
        });

        return {
            items: members,
            totalCount: count
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}, [],
{ revalidate: 3600, tags: ['getmembers'] })

export const getMemberByUserId= unstable_cache(async(userId: string)=> {
    try {
        console.log('getMemberByUserId')
        return prisma.member.findUnique({ where: { userId } })
    } catch (error) {
        console.log(error);
    }
},['userId'],{tags: ['getMemberByUserId']})

export const getMemberPhotosByUserId=unstable_cache(async(userId: string)=> {
    const member = await prisma.member.findUnique({
        where: { userId },
        select: { photos: true }
    });

    if (!member) return null;

    return member.photos.map(p => p) as Photo[];
},[],{tags:['getMemberPhotosByUserId']})

export async function updateLastActive() {
    const userId = await getAuthUserId();

    try {
        return prisma.member.update({
            where: { userId },
            data: { updated: new Date() }
        })
    } catch (error) {
        console.log(error);
        throw error;
    }
}